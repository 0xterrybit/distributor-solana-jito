root=$(pwd)


### CONFIG ZONE
csv_path="${root}/list/test.csv"
merkle_tree_path="${root}/proofs/mk/snapshot"
kv_path="${root}/proofs/kv/snapshot"
token_decimals=9
token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
base_key="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
### END CONFIG ZONE

cli=$root/target/debug/cli
max_nodes_per_tree=10000 # default value, can ignore the field

echo "create merkle tree proof"
$cli create-merkle-tree \
    --csv-path $csv_path \
    --merkle-tree-path $merkle_tree_path \
    --max-nodes-per-tree $max_nodes_per_tree \
    --amount 0 \
    --decimals $token_decimals \

echo "generate kv proofs"
$cli \
    --mint $token_mint \
    --base $base_key generate-kv-proof \
    --merkle-tree-path $merkle_tree_path \
    --kv-path $kv_path \
    --max-entries-per-file 100000
