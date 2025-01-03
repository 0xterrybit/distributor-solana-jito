1. distributor
    token_vesting

2. staking 

3. rewards

4. pay

    subscribe

cargo run --bin cli create-test-list \
    --csv-path proofs/csv/list.csv \
    --merkle-tree-path proofs/mk/tree \
    --amount 1000 \
    --decimals 9

cargo run --bin cli create-dummy-csv \
    --amount 1000 \
    --csv-path proofs/csv/list.csv \
    --num-records 10


cargo run --bin cli extend-list \
    --amount 99 \
    --csv-path proofs/csv/list.csv \
    --destination-path proofs/csv/list2.csv \
    --num-records 100





cargo run --bin cli -- \
    --mint Ay56xgpTi6LGASHP3FwTmi54MJzwh1AtbqYhWckkVLx2 \
    --priority-fee 1000000 \
    --keypair-path /Users/gaomin/.config/solana/rnspay_admin.json \
    --rpc-url 'https://solana-devnet.g.alchemy.com/v2/n1bvt38Ftko_vx5iLfOneXpyIxY0VyAQ' \
    --program-id E15eCY61CRBGV5cSEtKyxgmkDkCLnEgqdmyPSAhuFxc6 \
    --base 8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd \
    new-distributor \
    --start-vesting-ts 1735492557 \
    --end-vesting-ts 1735492558 \
    --merkle-tree-path /Users/gaomin/workspace/rns/distributor-solana-jup/proofs/mk/snapshot \
    --base-path /Users/gaomin/.config/solana/rnspay_admin.json \
    --clawback-start-ts 1735492559 \
    --activation-point 1735319759 \
    --activation-type 1 \
    --clawback-receiver-owner 8bsJcfGRyFWUEzS4bQfADTVBjReUm3YH89x1QY1qp3gd \
    --closable