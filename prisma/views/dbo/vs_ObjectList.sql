SELECT
  co.CID,
  co.Rank,
  o.OID,
  o.Type,
  o.CName,
  o.Since,
  o.LastModifiedDT,
  o.OwnerMID,
  o.nClick,
  o.bHided,
  o.bDel
FROM
  CO,
  Object AS o
WHERE
  co.OID = o.OID;