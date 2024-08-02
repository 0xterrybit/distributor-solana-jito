use crate::*;

pub fn process_get_slot_duration_by_time(
    args: &Args,
    slot_duration_by_time: &GetSlotDurationByTimeArgs,
) {
    let client = RpcClient::new_with_commitment(&args.rpc_url, CommitmentConfig::confirmed());
    let average_slot_time = get_average_slot_time(&client).unwrap();

    let slot_duration = slot_duration_by_time.time_duration * 1000 / average_slot_time;
    println!("slot duration {}", slot_duration);

    println!("average slot time {}", average_slot_time);
}
