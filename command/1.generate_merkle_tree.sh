root=$(pwd)


# ### CONFIG ZONE
csv_path="${root}/list/test.csv"
tree_path="${root}/proofs/mk/snapshot"
kv_path="${root}/proofs/kv/snapshot"
# token_decimals=9
# token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
# base_key="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
# ### END CONFIG ZONE

cli=$root/target/debug/cli


token_decimals=9
token_mint=""
base_key=""
max_nodes_per_tree=10 # default value, can ignore the field

# 解析参数
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --token-mint) token_mint="$2"; shift ;;  # 获取 --token-mint 参数的值
        --base-key) base_key="$2"; shift ;;  # 获取 --base-key 参数的值
        --token-decimals) token_decimals="$2"; shift ;;  # 获取 --token_decimals 参数的值
        --max-nodes-per-tree) max_nodes_per_tree="$2"; shift ;;  # 获取 --max_nodes_per_tree 参数的值
        *) echo "Unknown parameter: $1"; exit 1 ;;  # 处理未知参数
    esac
    shift
done

# echo ""
# echo "token_decimals:"$token_decimals
# echo "token_mint:"$token_mint
# echo "base_key:"$base_key
# echo "max_nodes_per_tree:"$max_nodes_per_tree
# echo ""

echo "create merkle tree proof"
$cli create-merkle-tree \
    --csv-path $csv_path \
    --merkle-tree-path $tree_path \
    --max-nodes-per-tree $max_nodes_per_tree \
    --decimals $token_decimals \
    --amount 0

echo "generate kv proofs"
$cli \
    --mint $token_mint \
    --base $base_key generate-kv-proof \
    --merkle-tree-path $tree_path \
    --kv-path $kv_path \
    --max-entries-per-file 100000
