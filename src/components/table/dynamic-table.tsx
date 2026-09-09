"use client";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";

import { useLngNs } from "@/i18n/hooks";
import { colorTokens } from "@/utils/theme/color-token";

export interface DynamicTableProps {
  data: Record<string, unknown>[];
  title?: string;
  height?: number | string;
  tableHeightLimit?: number | string;
}

const cleanValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r/g, "").trim();
};

const cleanColumnName = (key: string): string => {
  return key.replace(/\r/g, "").trim();
};

export const DynamicTable = (
  { data, title, height, tableHeightLimit }: DynamicTableProps,
) => {
  const t = useLngNs("data");
  const theme = useTheme();
  const colorToken = colorTokens(theme.palette.mode);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          {t("no-data").toUpperCase()}
        </Typography>
      </Box>
    );
  }

  const columns = Object.keys(data[0]).map(cleanColumnName);

  return (
    <Box sx={{ width: "100%", p: 2, position: "relative", height }}>
      {title && (
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}

      <TableContainer
        component={Paper}
        elevation={3}
        sx={{ height: tableHeightLimit }}
      >
        <Table
          sx={{ minWidth: 650, position: "relative" }}
          aria-label="dynamic data table"
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
            }}
          >
            <TableRow sx={{ backgroundColor: colorToken.primary[500] }}>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: theme.palette.common.white,
                    // fontWeight: "bold",
                    // fontSize: "1rem",
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: colorToken.grey[900],
                  },
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    color: theme.palette.common.black,
                  },
                }}
              >
                {columns.map((column, colIndex) => {
                  const originalKey = Object.keys(row).find((k) =>
                    cleanColumnName(k) === column
                  ) || column;

                  const cellValue = cleanValue(row[originalKey]);

                  return (
                    <TableCell
                      key={colIndex}
                      sx={{
                        py: 1,
                        color: "inherit",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      {cellValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Typography variant="body2" color="text.secondary">
          {t("total").replace("$n", data.length.toString())}
        </Typography>
      </Box>
    </Box>
  );
};
