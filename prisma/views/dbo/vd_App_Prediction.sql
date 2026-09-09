SELECT
  C.CID AS Project_Id,
  O.OID AS App_Id,
  (
    SELECT
      EName
    FROM
      Entity
    WHERE
      EID = O.Type
  ) AS App_Type,
  O.CName AS Name,
  O.CDes AS Description,
  O.Since AS Created_At,
  O.LastModifiedDT AS Updated_At,
  O.OwnerMID AS Owner_Mid,
  O.NOutlinks AS Active_Models,
  A.[Key] AS Api_Key,
  A.[Status] AS App_Status,
  A.DeploymentId AS Deployment_Id
FROM
  [dbo].[Object] AS O
  LEFT JOIN [dbo].[CO] AS CO ON CO.OID = O.OID
  LEFT JOIN [dbo].[App_Prediction] AS A ON O.OID = A.APID
  LEFT JOIN [dbo].[Class] AS C ON CO.CID = C.CID
WHERE
  O.TYPE IN (113);