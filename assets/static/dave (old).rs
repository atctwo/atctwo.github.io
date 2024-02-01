use std::{net::{SocketAddr, UdpSocket}, str, sync::{Arc, RwLock, mpsc::{self, Receiver, SyncSender}, Mutex}, collections::HashMap, time::Duration, thread};
use anyhow::anyhow;
use humantime::{parse_duration, format_duration};
use uuid::Uuid;
use crate::{args::CliArgs, dave_structs::{MpscEntry, SyncNodeCount, FileItem}, commands::{CommandParamsNodePing, CommandParamsNodePong, CommandParamsFileList, CommandParamsFileRemove, CommandParamsFileGet}};
use crate::commands::{
    CommandParams, 
    CommandParamsNodeLeave, CommandParamsNodeList
};
use crate::dave_structs::{NodeDirectoryItem, CommandLogEntry};
use crate::commands::Command;

#[derive(Debug)]
pub struct BlockDaveChain {

    // triple slash

    /// the id of this node - this will be send to other nodes and used as a URL at
    /// which this node can be reached
    id: String,

    // friendly name for this node
    name: String,

    /// UDP socket to read from and write to
    pub socket: Arc<RwLock<UdpSocket>>,

    /// data item index
    files: Arc<RwLock<HashMap<String, FileItem>>>,

    /// node directory
    directory: Arc<RwLock<HashMap<String, NodeDirectoryItem>>>,

    /// a log of commands handled by the server
    command_log: Arc<RwLock<HashMap<String, CommandLogEntry>>>,

    /// number of UDP packets handled
    pub packets_handled: Arc<RwLock<u32>>,

    /// reference to the command line arguments passed to the program
    args: Arc<CliArgs>,

    /// flag to indicate syncing is in progress, and statistics should be counted
    syncing: Arc<RwLock<bool>>,

    /// when syncing, how many responses were recorded
    syncing_response_count: Arc<RwLock<u32>>,

    /// when syncing, how many times was each node reported to exist or how many pings did it respond to
    syncing_node_count: Arc<RwLock<HashMap<String, SyncNodeCount>>>,

    /// mpsc channel to send event info to
    mpsc_tx: SyncSender<MpscEntry>,

    /// mpsc channel to receive event info from
    pub mpsc_rx: Mutex<Receiver<MpscEntry>>,

}

impl BlockDaveChain {

    //-----------------------------------------------------
    // method to create a new BlockDaveChain
    // (like a constructor)
    //-----------------------------------------------------

    pub fn new(args: Arc<CliArgs>) -> anyhow::Result<Self> {

        // determine id
        let id = format!("{}:{}", args.id, args.port);
        info!("Node ID is {id}");
        
        // determine friendly name
        let name = format!("{}:{}", hostname::get().unwrap().to_str().unwrap(), args.port);
        info!("Friendly name is {name}");

        // open udp socket
        let addr = format!("{}:{}", args.url, args.port);
        info!("Binding to IP {}", &addr);
        let socket = UdpSocket::bind(addr)?;
        socket.set_nonblocking(true).unwrap();

        // set up node directory with self as only entry
        let mut directory: HashMap<String, NodeDirectoryItem> = HashMap::new();
        directory.insert(id.clone(), NodeDirectoryItem{
            id:   id.clone(),
            name: name.clone(),
            tentative: false,
        });

        // if we are to assume the provided nodes are actually online, add them to the directory directly
        if args.assume_online {
            for node in &args.nodes {
                directory.insert(node.clone(), NodeDirectoryItem {
                    id: node.clone(), 
                    name: "".to_string(),
                    tentative: true
                });
            }
        }

        // create command log
        let cmd_log: HashMap<String, CommandLogEntry> = HashMap::new();

        // // parse sync frequency
        // let sync_rate = match parse_duration(&args.sync_rate) {
        //     Ok(rate) => { rate }
        //     Err(e) => {
        //         warn!("Failed to parse sync rate: {}.  Defaulting to 5 minutes", e);
        //         Duration::new(5*60, 0)
        //     }
        // };

        // // parse sync delay
        // let sync_delay = match parse_duration(&args.sync_delay) {
        //     Ok(rate) => { rate }
        //     Err(e) => {
        //         warn!("Failed to parse sync delay: {}.  Defaulting to 10 seconds", e);
        //         Duration::new(10, 0)
        //     }
        // };

        // if sync_delay > sync_rate {
        //     warn!("Sync delay is greater than sync rate!!!  This could cause issues");
        // }

        // create mpsc channel
        let (mpsc_tx, mpsc_rx) = mpsc::sync_channel::<MpscEntry>(2);

        Ok(BlockDaveChain { 
            id:                         id,
            name:                       name,
            socket:                     Arc::new(RwLock::new(socket)),
            files:                      Arc::new(RwLock::new(HashMap::new())),
            directory:                  Arc::new(RwLock::new(directory)),
            command_log:                Arc::new(RwLock::new(cmd_log)),
            packets_handled:            Arc::new(RwLock::new(0)),
            args:                       args,
            // sync_rate:                  sync_rate,
            // sync_delay:                 sync_delay,
            syncing:                    Arc::new(RwLock::new(false)),
            syncing_response_count:     Arc::new(RwLock::new(0)),
            syncing_node_count:         Arc::new(RwLock::new(HashMap::new())),
            mpsc_tx:                    mpsc_tx,
            mpsc_rx:                    Mutex::new(mpsc_rx),
        })
    }



    //-----------------------------------------------------
    // methods used for the main UDP listener thread
    //-----------------------------------------------------

    pub fn udp_stream_loop(&self) {

        // let the main thread know the udp listener is active
        self.mpsc_tx.send(MpscEntry::UdpListenerStarted).unwrap();

    }
    
    pub fn handle_udp_packet(&self, amt: usize, src: SocketAddr, buf: [u8; 2048]) {
        debug!("Got packet: '{:?}'... from {}", str::from_utf8(&buf[..10]).unwrap(), src.to_string());

        // parse packet
        match serde_json::from_str::<Command>(str::from_utf8(&buf[..amt]).unwrap()){
            
            Ok(cmd) => {
                info!("Received command (id={})", cmd.id);
                
                // get read lock on command log
                let cmd_log_ref = self.command_log.clone();
                let cmd_log_read = cmd_log_ref.read().unwrap();

                // check if command is already in log
                if !(*cmd_log_read).contains_key(&cmd.id) {

                    // command is new
                    info!("- command is new");

                    // add command to log
                    let id = format!("{}", cmd.id);
                    drop(cmd_log_read);
                    let mut cmd_log_write = cmd_log_ref.write().unwrap();
                    (*cmd_log_write).insert(id, CommandLogEntry::default());

                    // handle command
                    match &cmd.params {
                        // CommandParams::NodeNew(params) =>        self.handle_cmd_node_new(&cmd, params),
                        CommandParams::NodeLeave(params) =>    self.handle_cmd_node_leave(&cmd, params),
                        CommandParams::NodeList(params) =>      self.handle_cmd_node_list(&cmd, params),
                        CommandParams::NodePing(params) =>      self.handle_cmd_node_ping(&cmd, params),
                        CommandParams::NodePong(params) =>      self.handle_cmd_node_pong(&cmd, params),
                        CommandParams::FileList(params) =>      self.handle_cmd_file_list(&cmd, params),
                        CommandParams::FileRemove(params) =>  self.handle_cmd_file_remove(&cmd, params),
                        CommandParams::FileGet(params) =>        self.handle_cmd_file_get(&cmd, params),
                    }

                }
                else { debug!("- command already processed"); }

                // if ttl is 0, drop command
                // otherwise, propagate it
                if cmd.ttl != 0 {

                    // create copy of command
                    let mut cmd_copy = cmd.clone();

                    // if ttl is not -1, decrement it
                    if cmd_copy.ttl > 0 {
                        cmd_copy.ttl -= 1;
                    }

                    debug!("- command ttl is now {}", cmd_copy.ttl);

                    // propagate command
                    self.propagate_command(&cmd_copy, None, Some(&cmd.node_id));

                }
                else { debug!("- TTL is zero, dropping command"); }
            }

            Err(e) => {
                error!("Failed to parse command: {e}");
            }
        }
 

        // increase count
        let self_arc = self.packets_handled.clone();
        let mut self_rwl = self_arc.write().unwrap();
        *self_rwl += 1;
        debug!("Handled {} packets", *self_rwl);

        // respond
        // socket.send_to("katamari".as_bytes(), src).unwrap();
        
    }



    //-----------------------------------------------------
    // methods used for periodic sync
    //-----------------------------------------------------

    /// Method to perform the periodic sync
    pub fn periodic_sync(&self) {
        
        info!("Performing periodic sync.  This should take around {}", 
            format_duration( *self.args.sync_delay + (*self.args.sync_ping_delay * self.args.sync_ping_count.into()) )
        );

        //-----------------------------------------
        // Stage 1
        // initialisation
        //-----------------------------------------

        // clear response count
        let mut res_write = self.syncing_response_count.write().unwrap();
        *res_write = 0;
        drop(res_write);

        // reset node and ping count and populate with known node ids
        let dir_read = self.directory.read().unwrap();
        let mut node_write = self.syncing_node_count.write().unwrap();
        (*node_write).clear();
        for node in &*dir_read {
            if node.0 != &self.id {
                node_write.insert(node.0.clone(), SyncNodeCount::default());
            }
        }
        drop(node_write);
        drop(dir_read);



        // set syncing flag
        let mut syncing_write = self.syncing.write().unwrap();
        *syncing_write = true;
        drop(syncing_write);

        //-----------------------------------------
        // Stage 2
        // send node.list to all other nodes
        // to get an up-to-date list of nodes on
        // the cluster
        //-----------------------------------------

        // send node.list to other nodes, and request a response
        // this is to get an up-to-date list of all the nodes on the cluster
        self.send_cmd_node_list(None, true);

        // wait for sync delay (allow time for nodes to respond)
        debug!("sync: sleeping for {}", format_duration(self.args.sync_delay.into()));
        thread::sleep(self.args.sync_delay.into());

        //-----------------------------------------
        // Stage 3
        // send pings to known nodes
        //-----------------------------------------

        // now verify that each node is actually online by pinging each of them
        // - create send_ping and handle_ping and handle_pong
        // - pings and pongs have specific target IDs so nodes can ignore pings that aren't for them
        // - ping each node 5 times, with 1 second between each ping
        // - in the pong handler, if syncing, count the number of times each node ponged
        // - in the results handling bit of code, after pinging and waiting:
        //   - for each node, if 0 pongs were received, assume the node is offline

        // send pings
        for _p in 0..self.args.sync_ping_count {

            // get read lock on directory, and send a ping to each node
            let dir_read = self.directory.read().unwrap();
            for node in &*dir_read {
                self.send_cmd_node_ping(None, &node.0.clone());
            }
            drop(dir_read);

            // wait
            thread::sleep(self.args.sync_ping_delay.into());

        }


        //-----------------------------------------
        // Stage 4
        // end sync and handle results
        //-----------------------------------------

        // clear syncing flag
        let mut syncing_write = self.syncing.write().unwrap();
        *syncing_write = false;
        drop(syncing_write);

        // parse data
        let res_read = self.syncing_response_count.read().unwrap();
        let node_read = self.syncing_node_count.read().unwrap();

        debug!("node.list results:");
        debug!("- got {} responses", res_read);

        let builder_node = tabled::Table::builder(&*node_read);
        let table_node = builder_node.build()
        .with(tabled::settings::Style::rounded())
        .to_string();
        debug!("- responses per node:\n{}", table_node);

        // determine which nodes are offline
        for node in &*node_read {

            // ignore self
            if node.0 != &self.id {

                let mut alive_percent: f64 = 0.0;
                if *res_read != 0 { // avoid division by 0 if no nodes responded
                    alive_percent = (node.1.nodes / *res_read) as f64 * 100.0;
                }
                trace!("- node {} is known by {:.2}% of nodes", node.0, alive_percent);

                // if the number of nodes reporting the existance of node is below a threshold,
                // or it didn't respond to any pings at all,
                // remove the node and tell the others
                if alive_percent < self.args.offline_node_threshold || node.1.pings == 0 {

                    // remove node from own directory
                    self.remove_node(&node.0);

                    // tell all the other nodes that this node has left
                    self.send_cmd_node_leave(None, Some(&node.0));
                }

            }

        }

        info!("Periodic sync complete!");

    }





    //-----------------------------------------------------
    // methods for sending commands
    //-----------------------------------------------------

    /// Sends a [Command] to a single node
    fn send_command(&self, command: &Command, dest: &Vec<&String>) {

        // serialise command
        let json = serde_json::to_string(&command).unwrap();
        
        debug!("Sending raw command '{}'... to nodes {:#?}", &json[..10], &dest);
        
        // open socket to dest
        let sock_ref = self.socket.clone();
        let sock_write = sock_ref.write().unwrap();

        // write command
        for node in dest {
            if node != &&self.id {
                match (*sock_write).send_to(json.as_bytes(), &node) {
                    Ok(_) => {}
                    Err(e) => { error!("Error sending command to {node}: {e}"); }
                };
            }
        }

    }

    pub fn test_send_command(&self) {
        trace!("sending test command");
        // self.send_command(&"hello world".to_string(), &"127.0.0.1:8000".to_string());
    }

    /// Sends a [Command] to either all of the nodes in the directory, or a few specified nodes 
    /// 
    /// The node specified in the optional `src` won't be included _in [Self::directory].  If `dest` contains `src`,
    /// then it will still be sent to `src`.  This can be used to avoid two nodes propagating commands back and
    /// forth between each other.
    pub fn propagate_command(&self, command: &Command, dest: Option<&Vec<&String>>, src: Option<&String>) {

        info!("Propagating command {}", command.id);

        match dest {

            // send to specific ids
            Some(dest_ids) => { self.send_command(&command, dest_ids); }

            // send to all nodes in directory (except src)
            None => {

                // get read lock for directory
                let directory_ref = self.directory.clone();
                let directory_read = directory_ref.read().unwrap();

                // warn if we don't know about any nodes
                if (*directory_read).len() == 1 {
                    warn!("Can't propagate because no other nodes are known");
                }

                // clone the directory so the nodes not to send to can be removed
                let mut dir_clone = (&*directory_read).clone();

                // remove own id and sender id
                dir_clone.remove(&self.id);
                if src.is_some() { dir_clone.remove(src.unwrap()); }
                
                // get node ids from directory clone
                let dir_clone_keys: Vec<&String> = dir_clone.keys().collect();
                
                // send commands
                self.send_command(&command, &dir_clone_keys);
            }

        }

    }

    /// Send a node.list command - let other nodes know which nodes this node knows
    /// 
    /// If `dest` is specified, the command will only be sent to these nodes.
    /// Otherwise the command will be sent to all nodes in [Self::directory].
    pub fn send_cmd_node_list(&self, dest: Option<&Vec<&String>>, request_response: bool) {

        debug!("Sending command 'node.list' (dest={:?})", dest);

        // determine id
        let cmd_id = format!("{}/{}", self.id, Uuid::new_v4());
        debug!("- id={}", cmd_id);

        // get directory
        let dir_ref = self.directory.clone();
        let dir_read = dir_ref.read().unwrap();

        // create command struct
        let cmd = Command{
            id: cmd_id,
            node_id: self.id.clone(),
            ttl: self.args.ttl,
            params: CommandParams::NodeList(CommandParamsNodeList {
                directory: (*dir_read).clone(),
                request_response,
            })
        };
        // trace!("Command JSON\n{:#?}", cmd);
        drop(dir_read);

        // send new node announcement
        match dest {

            // send to specific destination
            Some(dest_id) => { self.send_command(&cmd, dest_id); }

            // send to all nodes in directory
            // this doesn't use propagate_command() because it should only
            // send to nodes specified on the command line, rather than the
            // whole directory
            None => { self.propagate_command(&cmd, None, None); }

        }

    }


    /// Send a node.leave command - tell other nodes this node is leaving
    /// 
    /// If `dest` is specified, the command will only be sent to these nodes.
    /// Otherwise the command will be sent to all nodes in [Self::directory].
    /// 
    /// If `node` is specified, this will be used as the ID of the leaving node.
    /// Otherwise this node's own id will be used.
    pub fn send_cmd_node_leave(&self, dest: Option<&Vec<&String>>, node: Option<&String>) {

        debug!("Sending command 'node.leave' (dest={:?})", dest);

        // determine id
        let cmd_id = format!("{}/{}", self.id, Uuid::new_v4());
        debug!("- id={}", cmd_id);

        // determine node id
        let node_id = match node {
            Some(n) => { n }
            None => { &self.id }
        };

        // create command struct
        let cmd = Command{
            id: cmd_id,
            node_id: self.id.clone(),
            ttl: self.args.ttl,
            params: CommandParams::NodeLeave(CommandParamsNodeLeave {
                id: node_id.clone()
            })
        };
        // trace!("Command JSON\n{:#?}", cmd);

        // send leave node announcement
        match dest {

            // send to specific destination
            Some(dest_id) => { self.send_command(&cmd, dest_id); }

            // send to all nodes in directory
            // this doesn't use propagate_command() because it should only
            // send to nodes specified on the command line, rather than the
            // whole directory
            None => { self.propagate_command(&cmd, None, None); }

        }

    }

    /// Send a node.ping command - ask another node to respond with a pong
    /// 
    /// The ultimate recipient of the command is described by `target`.  This
    /// allows the command to be sent to multiple nodes (to propagate), and
    /// still only be acted on by a single node.
    /// 
    /// If `dest` is specified, the command will only be sent to these nodes.
    /// Otherwise the command will be sent to all nodes in [Self::directory].
    pub fn send_cmd_node_ping(&self, dest: Option<&Vec<&String>>, target: &String) {

        debug!("Sending command 'node.ping' (dest={:?})", dest);

        // determine id
        let cmd_id = format!("{}/{}", self.id, Uuid::new_v4());
        debug!("- id={}", cmd_id);

        // create command struct
        let cmd = Command{
            id: cmd_id,
            node_id: self.id.clone(),
            ttl: self.args.ttl,
            params: CommandParams::NodePing(CommandParamsNodePing {
                id: target.clone(),
            })
        };
        // trace!("Command JSON\n{:#?}", cmd);

        // send new node announcement
        match dest {

            // send to specific destination
            Some(dest_id) => { self.send_command(&cmd, dest_id); }

            // send to all nodes in directory
            // this doesn't use propagate_command() because it should only
            // send to nodes specified on the command line, rather than the
            // whole directory
            None => { self.propagate_command(&cmd, None, None); }

        }

    }

    /// Send a node.pong command - ask another node to respond with a pong
    /// 
    /// The ultimate recipient of the command is described by `target`.  This
    /// allows the command to be sent to multiple nodes (to propagate), and
    /// still only be acted on by a single node.
    /// 
    /// If `dest` is specified, the command will only be sent to these nodes.
    /// Otherwise the command will be sent to all nodes in [Self::directory].
    pub fn send_cmd_node_pong(&self, dest: Option<&Vec<&String>>, target: &String) {

        debug!("Sending command 'node.pong' (dest={:?})", dest);

        // determine id
        let cmd_id = format!("{}/{}", self.id, Uuid::new_v4());
        debug!("- id={}", cmd_id);

        // create command struct
        let cmd = Command{
            id: cmd_id,
            node_id: self.id.clone(),
            ttl: self.args.ttl,
            params: CommandParams::NodePong(CommandParamsNodePong {
                id: target.clone(),
            })
        };
        // trace!("Command JSON\n{:#?}", cmd);

        // send new node announcement
        match dest {

            // send to specific destination
            Some(dest_id) => { self.send_command(&cmd, dest_id); }

            // send to all nodes in directory
            // this doesn't use propagate_command() because it should only
            // send to nodes specified on the command line, rather than the
            // whole directory
            None => { self.propagate_command(&cmd, None, None); }

        }

    }



    //-----------------------------------------------------
    // methods for handling commands
    //-----------------------------------------------------

    fn handle_cmd_node_list(&self, command: &Command, params: &CommandParamsNodeList) {
        debug!("handling command node.list");
        trace!("- command is: \n{:#?}", params);

        // if syncing, increment the response counter
        let syncing_read = self.syncing.read().unwrap();
        debug!("- syncing = {}", syncing_read);
        if *syncing_read {

            // get write lock on response counter
            let mut syncing_response_count_write = self.syncing_response_count.write().unwrap();
            (*syncing_response_count_write) += 1;

        }
        drop(syncing_read);

        // get directory
        let dir_ref = self.directory.clone();
        let mut dir_write = dir_ref.write().unwrap();

        // vector to store ids of new nodes to contact after directory lock is dropped
        let mut new_nodes: Vec<String> = vec![];

        // iterate through nodes and check for new ones
        for node in &params.directory {

            // if node doesn't already exists in our directory
            if !dir_write.contains_key(node.0) {

                // store node
                info!("Informed of new node: {}", node.0);
                dir_write.insert(node.0.clone(), node.1.clone());

                // add node to new vec to tell new node about this node later
                let node_id = node.0.clone();
                new_nodes.push(node_id);

            } else {

                // get node's entry in directory
                let mut node_dir_entry = dir_write.get_mut(node.0).unwrap();

                // if node is tentative
                if node_dir_entry.tentative {

                    info!("Updating details of tentative node: {}", node.0);

                    // update node details from command
                    node_dir_entry.name = node.1.name.clone();

                    // add node to new vec to tell new node about this node later
                    let node_id = node.0.clone();
                    new_nodes.push(node_id);

                    // clear tentative flag
                    // only clear it if the originator node says it's not tentative - this means
                    // that nodes can only be marked as not tentative by being told so by
                    // a node that knows the tentative node, or that node itself.
                    if !node.1.tentative {
                        trace!("- originator node says this one isn't tentative");
                        node_dir_entry.tentative = false;
                    }

                }

            }

            // if syncing, count the number of times each node is reported to be alive
            let syncing_read = self.syncing.read().unwrap();
            if *syncing_read {

                // get write lock on response counter
                let mut syncing_node_count_write = self.syncing_node_count.write().unwrap();
                let node_count = (*syncing_node_count_write).entry(node.0.clone()).or_default();
                node_count.nodes += 1;

            }
            drop(syncing_read);

        }

        // if originator node requested a response, add it to the new nodes list
        if params.request_response {
            new_nodes.push(command.node_id.clone());
        }

        // drop write lock
        drop(dir_write);

        // inform new nodes that this node exists
        let new_nodes_ref: Vec<&String> = new_nodes.iter().map(|s| { let s: &String = s; s } ).collect();
        if new_nodes_ref.len() > 0 {
            debug!("node.list: new_nodes: {:#?}\nnew_nodes_ref: {:#?}", new_nodes, new_nodes_ref);
            self.send_cmd_node_list(Some(&new_nodes_ref), false);
        }
        else { debug!("node.list: no new nodes, not sending any response"); }

    }

    fn handle_cmd_node_leave(&self, command: &Command, params: &CommandParamsNodeLeave) {
        info!("Node {} is leaving", params.id);
        self.remove_node(&params.id);        
    }

    fn handle_cmd_node_ping(&self, command: &Command, params: &CommandParamsNodePing) {
        debug!("Ping received from {}", command.node_id);

        // send pong if params.id == our id
        if params.id == self.id {
            self.send_cmd_node_pong(None, &params.id);
        }
    }

    fn handle_cmd_node_pong(&self, command: &Command, params: &CommandParamsNodePong) {
        debug!("Pong received from {}", command.node_id);

        // if synchronising, count the pings
        let syncing_read = self.syncing.read().unwrap();
        debug!("- syncing = {}", syncing_read);
        if *syncing_read {

            // get write lock on ping counter
            let mut syncing_node_count_write = self.syncing_node_count.write().unwrap();
            let node_count = (*syncing_node_count_write).entry(command.node_id.clone()).or_default();
            node_count.pings += 1;

        }
        drop(syncing_read);
    }

    fn handle_cmd_file_list(&self, command: &Command, params: &CommandParamsFileList) {
        debug!("Handling file.list");

        // get write lock on our file list
        let mut files_write = self.files.write().unwrap();

        // for each file in the originator's list
        for file in &params.files {

            // if file isn't already in our list, add it
            if !files_write.contains_key(file.0) {

                files_write.insert(file.0.clone(), file.1.clone());

            }

        }

        // don't need to explicitly tell other nodes about files that are new to this node
        // because this command will be propagated to all the other nodes that this node knows anyway
    }

    fn handle_cmd_file_remove(&self, command: &Command, params: &CommandParamsFileRemove) {
        debug!("Handling file.remove");
    }

    fn handle_cmd_file_get(&self, command: &Command, params: &CommandParamsFileGet) {
        debug!("Handling file.get");
    }





    //-----------------------------------------------------
    // methods for handling the cluster
    //-----------------------------------------------------

    pub fn join_cluster(&self) {

        // inform all other known nodes of the nodes this node knows, including self.
        // don't request a response because this node will be new or tentative anyway, and
        // so will receive a response
        self.send_cmd_node_list(None, false);

    }

    pub fn leave_cluster(&self) {

        info!("Leaving cluster and cleaning up...");

        // inform all known nodes that this node is leaving
        self.send_cmd_node_leave(None, None);

        // send signal that the node has left the cluster
        self.mpsc_tx.send(MpscEntry::NodeLeave).unwrap();

    }

    fn remove_node(&self, node_id: &String) {

        // get directory
        let dir_ref = self.directory.clone();
        let mut dir_write = dir_ref.write().unwrap();

        // if node is in dir
        if dir_write.contains_key(node_id) {

            // remove node from directory
            dir_write.remove(node_id);
            debug!("- removed {} from directory", node_id);

        }
        else { debug!("- node {} was not in directory", node_id); }

    }



    //-----------------------------------------------------
    // methods for handling files
    //-----------------------------------------------------

    /// Upload a local file to the cluster
    /// 
    /// `local_file_name` should be the name of a local file or path to a file to upload.
    pub fn upload_file(&self, local_file_name: &String) {

        info!("Uploading file {}...", local_file_name);

    }

    /// Download a file from the cluster
    /// 
    /// `file_id` should be the id of a file to download.
    /// `output` should be the file name or path to write the file to (or [None] for stdout)
    pub fn download_file(&self, file_id: &String, output: Option<&String>) {
        info!("Downloading file {} to {}", file_id, match output {Some(o) => {o} None => "stdout"});
        warn!("not yet implemented");
    }

    pub fn remove_file(&self, file_id: &String) {
        info!("Removing file {}", file_id);
        warn!("not yet implemented");
    }



    //-----------------------------------------------------
    // methods for debug commands
    //-----------------------------------------------------

    pub fn debug_node(&self) {
        debug!("Node Details:");
        debug!("- id:   {}", self.id);
        debug!("- name: {}", self.name);
    }

    pub fn debug_dir_list(&self) {

        // get directory
        let dir_ref = self.directory.clone();
        let dir_read = dir_ref.read().unwrap();

        // list items in node directory
        let builder = tabled::Table::builder(&*dir_read);
        let table = builder.build()
            .with(tabled::settings::Style::rounded())
            .to_string();

        debug!("Node Directory:\n{}", table);

    }

    pub fn debug_dir_rm(&self, id: &String) -> anyhow::Result<(), anyhow::Error> {

        // get write lock on directory
        let dir_ref = self.directory.clone();
        let mut dir_write = dir_ref.write().unwrap();

        // check that id is in directory
        if !dir_write.contains_key(id) {
            return Err(anyhow!("Node does not exist in directory"));
        }

        // remove node
        dir_write.remove(id);

        Ok(())
    }

    pub fn debug_file_list(&self) {

        // get read lock on files
        let files_read = self.files.read().unwrap();

        // list items in file list
        let builder = tabled::Table::builder(&*files_read);
        let table = builder.build()
            .with(tabled::settings::Style::rounded())
            .to_string();

        debug!("File List:\n{}", table);

    }

}