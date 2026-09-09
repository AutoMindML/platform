SELECT
  O.OID AS oid,
  (
    SELECT
      VALUE
    FROM
      STRING_SPLIT(
        (
          SELECT
            EName
          FROM
            Entity
          WHERE
            EID = O.Type
        ),
        ':',
        1
      )
    ORDER BY
      ordinal ASC OFFSET 1 ROWS
    FETCH FIRST
      1 ROWS ONLY
  ) AS ENGINE_TYPE,
  O.CName AS name,
  O.CDes AS description,
  O.EName AS md5,
  O.Since AS created_at,
  O.LastModifiedDT AS updated_at,
  O.DataByte AS used_status,
  O.OwnerMID AS owner_mid,
  O.bHided AS is_hided,
  O.bDel AS is_deleted,
  E.Handler AS handler,
  E.ConnectionData AS connection_data
FROM
  [dbo].[Object] AS O
  LEFT JOIN [dbo].[ML_Engine] AS E ON O.OID = E.MLEID
WHERE
  O.Type = 111;