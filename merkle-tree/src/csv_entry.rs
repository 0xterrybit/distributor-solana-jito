use std::{fs::File, path::PathBuf, result};

use serde::{Deserialize, Serialize};

use crate::error::MerkleTreeError;

pub type Result<T> = result::Result<T, MerkleTreeError>;

/// Represents a single entry in a CSV
#[derive(Debug, Clone, Eq, Hash, PartialEq, Serialize, Deserialize)]
pub struct CsvEntry {
    /// Pubkey of the claimant; will be responsible for signing the claim
    pub pubkey: String,
    /// amount unlocked, (ui amount)
    pub amount: String,
    /// amount locked, (ui amount)
    pub locked_amount: Option<String>,
}

impl CsvEntry {
    pub fn new_from_file(path: &PathBuf) -> Result<Vec<Self>> {
        let file = File::open(path)?;
        let mut rdr = csv::Reader::from_reader(file);

        let mut entries = Vec::new();
        for result in rdr.deserialize() {
            let record: CsvEntry = result.unwrap();
            entries.push(record);
        }

        Ok(entries)
    }
}
