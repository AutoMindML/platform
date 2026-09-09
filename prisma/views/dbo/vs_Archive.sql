SELECT
  o.OID,
  O.[Type],
  o.CName,
  o.CDes,
  a.[FileName],
  a.FileExtension,
  c.Title AS MIMEType,
  o.nClick,
  a.Keywords,
  a.Lang,
  a.Indexable,
  a.IndexInfo,
  o.Since,
  o.LastModifiedDT,
  o.bHided,
  o.bDel
FROM
  Archive AS a,
  Object AS o,
  ContentType AS c
WHERE
  a.AID = o.OID
  AND a.ContentType = c.CTID;