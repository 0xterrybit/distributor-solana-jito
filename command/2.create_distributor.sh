root=$(pwd)
home_directory="$HOME"

# csv_path="[path to csv]"
csv_path="${root}/list/test.csv"
merkle_tree_path="${root}/proofs/mk/snapshot"
token_decimals="9"

rpc="https://solana-devnet.g.alchemy.com/v2/n1bvt38Ftko_vx5iLfOneXpyIxY0VyAQ"


# Keypair_path to the address that will deploy distributor (admin), that address also need to prepare enough token to fund merkle tree
# Note: after deployment is suscessful, and team doesn't need to update anything, admin of distributor should be transfer  to team's multisig
# Command: 
# target/debug/cli --mint $token_mint --base $base_key --keypair-path $keypair_path --rpc-url $rpc set-admin --new-admin $new_admin --merkle-tree-path $merkle_tree_path
keypair_path="${home_directory}/.config/solana/rnspay_admin.json"


# the address that will receive token that user haven't claimed yet, should be team's multisig
clawback_receiver_owner="8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd"  


## caculated variable, can ignore this
# kv_path="[path to kv proofs]"
priority_fee=1000000 # priority fee, can use other number
max_nodes_per_tree=10 # default value, can ignore the field
token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"

base_path="${home_directory}/.config/solana/devnet_id.json"  
base_key=$(solana-keygen pubkey $base_path)


now=1735319759
# target/debug/cli --mint $token_mint --base $base_key --priority-fee $priority_fee --keypair-path $keypair_path --rpc-url $rpc set-enable-timestamp --merkle-tree-path $merkle_tree_path --timestamp $activation_point
activation_point=$(($now))
activation_type=1

# clawback_start_ts should be in future, at least 1 day from current time
clawback_start_ts=$(($now + 2*86400))

end_vesting_ts=$((clawback_start_ts - 1)) # we dont care for end_vesting_ts and start_vesting ts
start_vesting_ts=$((end_vesting_ts - 1))    

admin=$(solana-keygen pubkey $keypair_path)

program_id="E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6"



echo "create merkle tree proof"
cargo run --bin cli -- create-merkle-tree \
    --csv-path $csv_path \
    --merkle-tree-path $merkle_tree_path \
    --max-nodes-per-tree $max_nodes_per_tree \
    --amount 0 \
    --decimals $token_decimals

echo "deploy distributor"
cargo run --bin cli --  \
    --mint $token_mint \
    --priority-fee $priority_fee \
    --keypair-path $keypair_path \
    --rpc-url $rpc \
    --program-id $program_id \
    --base $base_key \
    new-distributor \
    --start-vesting-ts $start_vesting_ts \
    --end-vesting-ts $end_vesting_ts \
    --merkle-tree-path $merkle_tree_path \
    --base-path $base_path \
    --clawback-start-ts $clawback_start_ts \
    --activation-point $activation_point \
    --activation-type $activation_type \
    --clawback-receiver-owner $clawback_receiver_owner \
    --closable

echo "fund distributor"
target/debug/cli \
    --mint $token_mint \
    --priority-fee $priority_fee \
    --base $base_key \
    --keypair-path $keypair_path \
    --rpc-url $rpc fund-all \
    --merkle-tree-path $merkle_tree_path

echo "verify"
# target/debug/cli \
#     --mint $token_mint \
#     --base $base_key \
#     --rpc-url $rpc verify \
#     --merkle-tree-path $merkle_tree_path \
#     --clawback-start-ts $clawback_start_ts \
#     --activation-point $activation_point \
#     --activation-type $activation_type \
#     --admin $admin \
#     --clawback-receiver-owner $clawback_receiver_owner \
#     --closable \
#     --bonus-multiplier 1
    