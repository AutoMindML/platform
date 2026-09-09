CREATE VIEW dbo.vd_data_fusion AS
SELECT
  DID AS fusion_id,
  Datasets AS dataset_ids,
  Relationships AS relationships,
  TargetDataset AS target_dataset_id,
  Pks AS primary_keys,
  Position AS position
FROM
  dbo.DFM