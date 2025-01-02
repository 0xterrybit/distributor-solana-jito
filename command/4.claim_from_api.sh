### CONFIG ZONE
token_mint="BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf"
rpc="https://solana-devnet.g.alchemy.com/v2/n1bvt38Ftko_vx5iLfOneXpyIxY0VyAQ"
# keypair_path="[Path to keypair]"

home_directory="$HOME"
keypair_path="${home_directory}/.config/solana/rnspay_admin.json"

priority_fee=1000 # priority fee, can update this
### END CONFIG ZONE

# root=$(pwd)
# cli=$root/target/debug/cli

# destination_owner="8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd"

echo "Claim tokens"
cargo run --bin cli -- --mint $token_mint \
    --priority-fee $priority_fee \
    --rpc-url $rpc \
    --keypair-path $keypair_path \
    --program-id "E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6" \
    claim-from-api \
    --root-api "http://localhost:8080" \
    --destination-owner "8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd"


# 8Ez6wwXdS58PyBGxGSB3MQuMRuJsAXaxhMwE79ngVxzU
# cargo run --bin server -- \
#     --merkle-tree-path proofs/mk/snapshot  \
#     --mint BdQwBa4xv7TWuKqfA9Y2ojDAkKfhhqjtwmKhNzkX86Nf \
#     --base 8Ez6wwXdS58PyBGxGSB3MQuMRuJsAXaxhMwE79ngVxzU \
#     --program-id E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6