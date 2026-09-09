SELECT
  CID AS cid,
  EName AS name,
  CDes AS description,
  Since AS created_at,
  LastModifiedDT AS updated_at,
  OwnerMID AS owner_mid
FROM
  Class
WHERE
  NamePath LIKE 'member/%/project/%'
  AND bHided = 0
  AND bDel = 0;