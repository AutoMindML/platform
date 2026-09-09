SELECT
  i.PCID AS CID,
  i.Rank,
  c.CID AS CCID,
  c.Type,
  c.CName,
  c.CDes,
  c.Since,
  c.LastModifiedDT,
  c.nObject,
  c.nClick,
  c.Keywords,
  c.OwnerMID,
  c.bHided,
  c.bDel
FROM
  Inheritance AS i,
  Class AS c
WHERE
  i.CCID = c.CID;