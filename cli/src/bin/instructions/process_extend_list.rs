use crate::*;
use clap::{Parser};
use rand::{Rng, SeedableRng}; // 引入 rand crate
use rand::rngs::StdRng; // 使用标准随机数生成器
use std::time::{SystemTime, UNIX_EPOCH}; // 用于获取当前时间戳


pub fn process_extend_list(extend_list_args: &ExtendListArgs) {
    
    let seed = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let mut rng = StdRng::seed_from_u64(seed); // 使用时间戳作为种子

    // add my key
    let mut full_list = vec![];
    for _i in 0..(extend_list_args.num_records) {

        let mut random_bytes = [0u8; 32]; // 假设 Pubkey 是 32 字节
        rng.fill(&mut random_bytes); // 填充随机字节
        let random_pubkey = Pubkey::new_from_array(random_bytes); 

        full_list.push((random_pubkey, extend_list_args.amount.to_string()));
    }

    let mut wtr = Writer::from_path(&extend_list_args.destination_path).unwrap();
    wtr.write_record(&["pubkey", "amount"]).unwrap();

    for address in full_list.iter() {
        wtr.write_record(&[address.0.to_string(), address.1.to_string()]).unwrap();
    }

    wtr.flush().unwrap();
}


#[derive(Parser, Debug)]
pub struct ExtendListArgs {
    /// CSV path
    #[clap(long, env)]
    pub csv_path: PathBuf,
    #[clap(long, env)]
    pub num_records: u64,
    #[clap(long, env)]
    pub amount: u64,
    #[clap(long, env)]
    pub destination_path: String,
}
