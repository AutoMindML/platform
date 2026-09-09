SELECT
  o.OID,
  o.Type,
  o.CName,
  o.CDes,
  p.Detail,
  p.StartDT,
  p.EndDT,
  o.Since,
  o.LastModifiedDT,
  o.OwnerMID,
  o.bHided,
  o.bDel
FROM
  Post AS p,
  Object AS o
WHERE
  p.PID = O.OID;