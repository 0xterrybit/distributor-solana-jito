root=$(pwd)
cli=$root/target/debug/cli
home_directory="$HOME"

# csv_path="[path to csv]"
csv_path="${root}/list/test_1_7.csv"
merkle_tree_path="${root}/proofs/mk/test_1_7"
kv_path="${root}/proofs/kv/test_1_7"

decimals="9"

rpc_url="http://localhost:8899"
# rpc="https://solana-devnet.g.alchemy.com/v2/n1bvt38Ftko_vx5iLfOneXpyIxY0VyAQ"

# token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"

# target/debug/cli --mint $token_mint --base $base_key --keypair-path $keypair_path --rpc-url $rpc set-admin --new-admin $new_admin --merkle-tree-path $merkle_tree_path
keypair_path="${home_directory}/.config/solana/rnspay_admin.json"

# the address that will receive token that user haven't claimed yet, should be team's multisig
# clawback_receiver_owner="8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd"  

base_path="${home_directory}/.config/solana/rnspay_admin.json"  
base_key=$(solana-keygen pubkey $base_path)

token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
program_id="E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6"

# clawback_receiver_owner=""
clawback_receiver_owner="8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd"  


rpc_url="https://solana-devnet.g.alchemy.com/v2/n1bvt38Ftko_vx5iLfOneXpyIxY0VyAQ"


echo ""
echo "token_mint:"$token_mint
echo "base_key:"$base_key
echo "rpc_url:"$rpc_url
echo "program_id:"$program_id
echo "--merkle-tree-path:"$merkle_tree_path
echo ""


## caculated variable, can ignore this
# kv_path="[path to kv proofs]"
priority_fee=1000000 # priority fee, can use other number
max_nodes_per_tree=1000 # default value, can ignore the field
# program_id="E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6"


now=1735319759
# target/debug/cli --mint $token_mint --base $base_key --priority-fee $priority_fee --keypair-path $keypair_path --rpc-url $rpc set-enable-timestamp --merkle-tree-path $merkle_tree_path --timestamp $activation_point
activation_point=$(($now))
activation_type=1

# clawback_start_ts should be in future, at least 1 day from current time
clawback_start_ts=$(($now + 2*86400))

end_vesting_ts=$((clawback_start_ts - 1)) # we dont care for end_vesting_ts and start_vesting ts
start_vesting_ts=$((end_vesting_ts - 1))    

admin=$(solana-keygen pubkey $keypair_path)

echo "create merkle tree proof"
cargo run --bin cli -- create-merkle-tree \
    --csv-path $csv_path \
    --merkle-tree-path $merkle_tree_path \
    --max-nodes-per-tree $max_nodes_per_tree \
    --decimals $decimals \
    --version 2

# echo "deploy distributor"
# cargo run --bin cli -- --mint $token_mint \
#     --priority-fee $priority_fee \
#     --keypair-path $keypair_path \
#     --rpc-url $rpc_url \
#     --program-id $program_id \
#     --base $base_key \
#     new-distributor --start-vesting-ts $start_vesting_ts \
#     --end-vesting-ts $end_vesting_ts \
#     --merkle-tree-path $merkle_tree_path \
#     --base-path $base_path \
#     --clawback-start-ts $clawback_start_ts \
#     --activation-point $activation_point \
#     --activation-type $activation_type \
#     --clawback-receiver-owner $clawback_receiver_owner \
#     --closable

# echo "fund distributor"
# target/debug/cli \
#     --mint $token_mint \
#     --priority-fee $priority_fee \
#     --base $base_key \
#     --keypair-path $keypair_path \
#     --rpc-url $rpc_url fund-all \
#     --merkle-tree-path $merkle_tree_path

# echo "verify"
# target/debug/cli \
#     --mint $token_mint \
#     --base $base_key \
#     --rpc-url $rpc_url verify \
#     --merkle-tree-path $merkle_tree_path \
#     --clawback-start-ts $clawback_start_ts \
#     --activation-point $activation_point \
#     --activation-type $activation_type \
#     --admin $admin \
#     --clawback-receiver-owner $clawback_receiver_owner \
#     --closable \
#     --bonus-multiplier 1
    


echo "generate kv proofs"
$cli \
    --mint $token_mint \
    --base $base_key generate-kv-proof \
    --merkle-tree-path $merkle_tree_path \
    --kv-path $kv_path \
    --max-entries-per-file 3