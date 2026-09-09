"use client";

import HeaderSection from "./_components/header-section";
import {
  CanvasTransform,
  Connection,
  ObjectPosition,
  TableCardColumnList,
  TableInstance,
} from "./_components/schema";
import EditAppBar from "../../../../../../components/app-bar/edit-app-bar";
import EmptyBlock from "../_components/empty-block";

import Close from "@mui/icons-material/Close";
import DragIndicator from "@mui/icons-material/DragIndicator";
import LinkIcon from "@mui/icons-material/Link";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type React from "react";

import GeneralSnackbar, {
  GeneralSnackbarData,
} from "@/components/snackbar/general-snackbar";
import { DynamicTable } from "@/components/table/dynamic-table";
import { trpc } from "@/server/trpc/client";
import { createCurvePath } from "@/utils/svg";

const initPosition = 100;
const canvaOffset = 5000;
const canvaSize = 10000;
const tableCardWidth = 360;
const tableCardHeaderHeight = 56;
const tableCardRowHeight = 73;

export default function DataFusionPage() {
  const { id: fusion_id } = useParams<{ id: string }>();
  const datasets = trpc.dataset.getManyDatasets.useQuery();
  const savedDataFusion = trpc.automl.fusion.getSavedDataFusion.useQuery(
    Number(fusion_id),
    { refetchOnMount: true, staleTime: 0 },
  );
  const theme = useTheme();
  const [generalSnackbarData, setGeneralSnackbarData] = useState<
    GeneralSnackbarData
  >({ open: false, message: "", severity: "success" });
  const [addedTables, setAddedTables] = useState<TableInstance[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // FIXME: this will cause useEffect bug below
  const datasetPreviews = trpc.dataset.getDatasetPreview.useQuery(
    datasets.data?.filter((v) => v.source_type === "file").map((v) =>
      v.oid.toString()
    ) ?? [],
  );

  const availableTables: TableCardColumnList[] = useMemo(() => {
    return datasets.data?.filter((v) => v.source_type === "file").map((v) => {
      const col_types = v.col_types?.split(",") ?? [];
      const col_names = v.col_names?.split(",") ?? [];

      const datasetPreview = datasetPreviews.data?.[v.oid.toString()];
      const firstRow = datasetPreview?.at(0) ?? {};

      return {
        id: v.oid.toString(),
        rows: v.rows ?? 0,
        name: v.name ?? "",
        columns: col_names.map((col, i) => {
          return {
            name: col,
            type: col_types[i],
            sample: String(firstRow?.[col]),
          };
        }),
      };
    }) ?? [];
  }, [datasets.data, datasetPreviews.data]);

  useEffect(() => {
    if (!savedDataFusion.data) return;

    setAddedTables(() => {
      return savedDataFusion.data.dataset_ids.map((id, idx) => {
        const table = datasets.data?.find((v) => v.oid.toString() == id);
        if (!table) return undefined;

        const col_types = table.col_types?.split(",") ?? [];
        const datasetPreview = datasetPreviews.data?.[id];
        const firstRow = datasetPreview?.at(0) ?? {};

        return {
          "id": id,
          "tableId": id,
          "position": savedDataFusion.data.position[idx],
          "name": table.name ?? "",
          "columns": table.col_names?.split(",").map((v, i) => ({
            name: v,
            type: col_types[i],
            sample: String(firstRow?.[v]),
          })) ?? [],
          "isTarget": id === savedDataFusion.data.target_dataset_id.toString(),
          "primaryKey": savedDataFusion.data.primary_keys[idx],
        };
      }).filter((v) => v !== undefined);
    });
    setConnections(savedDataFusion.data.relationships);
  }, [savedDataFusion.data, datasets.data, datasetPreviews.data]);

  const putDataFusion = trpc.automl.fusion.putDataFusion.useMutation();
  const featureGenerated = trpc.automl.fusion.getFeatureGenerated.useQuery(
    Number(fusion_id),
  );
  const postFeatureGenerated = trpc.automl.fusion.postFeatureGenerated
    .useMutation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<
    {
      tableId: string;
      column: string;
    } | null
  >(null);
  const [showPreview, setShowPreview] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null,
  );
  const [selectedConnection, setSelectedConnection] = useState<string | null>(
    null,
  );
  const [contextMenu, setContextMenu] = useState<
    { x: number; y: number; connectionId: string } | null
  >(null);

  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [mousePosition, setMousePosition] = useState<
    ObjectPosition | null
  >(null);
  const [hoveredColumn, setHoveredColumn] = useState<
    { tableId: string; column: string } | null
  >(null);

  const [, setForceUpdate] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const tableDragStart = useRef({ x: 0, y: 0 });
  const tableDraggingPos = useRef({ x: 0, y: 0 });
  const panStartPos = useRef({ x: 0, y: 0 });
  const canvasStartTransform = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const cardColumnListRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // save added tables and relationships
  const saveTableRelationshipState = useCallback(
    async (addedTables: TableInstance[], connections: Connection[]) => {
      const targetId = addedTables.find((v) => v.isTarget)?.tableId;

      if (!targetId) {
        return;
      }

      await putDataFusion.mutateAsync({
        fusion_id: Number(fusion_id),
        dataset_ids: addedTables.map((v) => v.tableId) ?? [],
        primary_keys: addedTables.map((v) => v.primaryKey ?? "") ?? [],
        target_dataset_id: Number(targetId),
        position: addedTables.map((v) => v.position),
        relationships: connections,
      });

      featureGenerated.refetch();
    },
    [fusion_id, putDataFusion, featureGenerated],
  );

  const handleAddTable = (table: TableCardColumnList) => {
    const gap = 100;
    const newTable: TableInstance = {
      // id: `${table.id}_${Date.now()}`,
      id: table.id,
      tableId: table.id,
      name: table.name,
      position: {
        x: initPosition + addedTables.length * (tableCardWidth + gap),
        y: initPosition + addedTables.length * 0,
      },
      primaryKey: null,
      isTarget: addedTables.length === 0,
      columns: table.columns,
    };
    setAddedTables([...addedTables, newTable]);
    setAnchorEl(null);
    saveTableRelationshipState([...addedTables, newTable], connections);
  };

  const handleRemoveTable = (tableId: string) => {
    if (addedTables.find((v) => v.id === tableId)?.isTarget) {
      setGeneralSnackbarData({
        open: true,
        message:
          "Data fusion must has one target, specify another target before delete",
        severity: "warning",
      });
      return;
    }
    setAddedTables(addedTables.filter((t) => t.id !== tableId));
    setConnections(
      connections.filter((c) =>
        c.fromTable !== tableId && c.toTable !== tableId
      ),
    );
    saveTableRelationshipState(
      addedTables.filter((t) => t.id !== tableId),
      connections.filter((c) =>
        c.fromTable !== tableId && c.toTable !== tableId
      ),
    );
  };

  const handleSetPrimaryKey = (tableId: string, columnName: string) => {
    setAddedTables(
      addedTables.map((t) =>
        t.id === tableId
          ? {
            ...t,
            primaryKey: t.primaryKey === columnName ? null : columnName,
          }
          : t
      ),
    );
    saveTableRelationshipState(
      addedTables.map((t) =>
        t.id === tableId
          ? {
            ...t,
            primaryKey: t.primaryKey === columnName ? null : columnName,
          }
          : t
      ),
      connections,
    );
  };

  const handleSetTarget = (tableId: string) => {
    setAddedTables(
      addedTables.map((t) => ({ ...t, isTarget: t.id === tableId })),
    );
    saveTableRelationshipState(
      addedTables.map((t) => ({ ...t, isTarget: t.id === tableId })),
      connections,
    );
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      if ((e.target as HTMLElement).closest(".no-drag")) return;

      e.stopPropagation();
      const table = addedTables.find((t) => t.id === tableId);
      if (table) {
        setDraggingTable(tableId);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        tableDragStart.current = { x: table.position.x, y: table.position.y };
      }
    },
    [addedTables],
  );

  const handleConnectionRightClick = useCallback(
    (e: React.MouseEvent, connectionId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, connectionId });
      setSelectedConnection(connectionId);
    },
    [],
  );

  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      setConnections(connections.filter((c) => c.id !== connectionId));
      setSelectedConnection(null);
      setContextMenu(null);
      saveTableRelationshipState(
        addedTables,
        connections.filter((c) => c.id !== connectionId),
      );
    },
    [connections, addedTables, saveTableRelationshipState],
  );

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnection(connectionId);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedConnection) {
        // Prevent default backspace navigation
        e.preventDefault();
        handleDeleteConnection(selectedConnection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedConnection, handleDeleteConnection]);

  const handleCanvasClick = useCallback(() => {
    setContextMenu(null);
    setSelectedConnection(null);
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Close context menu
      setContextMenu(null);
      setSelectedConnection(null);

      // Only pan if clicking on canvas background (not on a table)
      if ((e.target as HTMLElement).closest("[data-table-card]")) return;

      setIsPanning(true);
      panStartPos.current = { x: e.clientX, y: e.clientY };
      canvasStartTransform.current = {
        x: canvasTransform.x,
        y: canvasTransform.y,
      };
    },
    [canvasTransform],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (connectingFrom && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvasTransform.x) /
          canvasTransform.scale;
        const y = (e.clientY - rect.top - canvasTransform.y) /
          canvasTransform.scale;
        setMousePosition({ x, y });
      }

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        // Handle table dragging
        if (draggingTable) {
          const deltaX = (e.clientX - dragStartPos.current.x) /
            canvasTransform.scale;
          const deltaY = (e.clientY - dragStartPos.current.y) /
            canvasTransform.scale;

          tableDraggingPos.current.x = tableDragStart.current.x + deltaX;
          tableDraggingPos.current.y = tableDragStart.current.y + deltaY;

          setAddedTables((prev) =>
            prev.map((t) =>
              t.id === draggingTable
                ? {
                  ...t,
                  position: {
                    x: tableDragStart.current.x + deltaX,
                    y: tableDragStart.current.y + deltaY,
                  },
                }
                : t
            )
          );
        }

        // Handle canvas panning
        if (isPanning) {
          const deltaX = e.clientX - panStartPos.current.x;
          const deltaY = e.clientY - panStartPos.current.y;

          setCanvasTransform((prev) => ({
            ...prev,
            x: canvasStartTransform.current.x + deltaX,
            y: canvasStartTransform.current.y + deltaY,
          }));
        }
      });
    },
    [
      draggingTable,
      isPanning,
      canvasTransform.scale,
      canvasTransform.x,
      canvasTransform.y,
      connectingFrom,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingTable(null);
    setIsPanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    // FIXME: this will update frequently
    saveTableRelationshipState(addedTables, connections);
  }, [addedTables, connections, saveTableRelationshipState]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!e.altKey) return;

      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate mouse position in world coordinates before zoom
      const worldX = (mouseX - canvasTransform.x) / canvasTransform.scale;
      const worldY = (mouseY - canvasTransform.y) / canvasTransform.scale;

      // Calculate new scale
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(
        Math.max(0.3, canvasTransform.scale + delta),
        3,
      );

      // Calculate new offset to keep mouse position fixed
      const newX = mouseX - worldX * newScale;
      const newY = mouseY - worldY * newScale;

      setCanvasTransform({
        x: newX,
        y: newY,
        scale: newScale,
      });
    },
    [canvasTransform],
  );

  const handleZoomIn = useCallback(() => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 3),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.3),
    }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      lastTouchDistance.current = distance;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        e.touches.length === 2 && lastTouchDistance.current && canvasRef.current
      ) {
        e.preventDefault();

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        const delta = (distance - lastTouchDistance.current) * 0.01;
        const newScale = Math.min(
          Math.max(0.3, canvasTransform.scale + delta),
          3,
        );

        setCanvasTransform((prev) => ({
          ...prev,
          scale: newScale,
        }));

        lastTouchDistance.current = distance;
      }
    },
    [canvasTransform.scale],
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  const isConnectionDuplicateOrNotValid = (
    connections: Connection[],
    newConnection: Connection,
  ) => {
    // check duplicate
    const isDuplicate = connections.find((value) =>
      (
        value.fromTable === newConnection.fromTable &&
        value.fromColumn === newConnection.fromColumn &&
        value.toTable === newConnection.toTable &&
        value.toColumn === newConnection.toColumn
      ) || (
        value.fromTable === newConnection.toTable &&
        value.fromColumn === newConnection.toColumn &&
        value.toTable === newConnection.fromTable &&
        value.toColumn === newConnection.fromColumn
      )
    );

    const hasOneFromTable = connections.find((value) =>
      value.toTable === newConnection.toTable &&
      value.toColumn === newConnection.toColumn
    );

    return isDuplicate || hasOneFromTable;
  };

  // This handler records the start of a connection on the first click
  // and records the second connection when the first one exists
  const handleStartConnection = useCallback(
    (tableId: string, columnName: string) => {
      if (connectingFrom) {
        // Complete the connection
        if (connectingFrom.tableId !== tableId) {
          const newConnection: Connection = {
            // id:
            //   `${connectingFrom.tableId}_${connectingFrom.column}_${tableId}_${columnName}_${Date.now()}`,
            id:
              `${connectingFrom.tableId}_${connectingFrom.column}_${tableId}_${columnName}`,
            fromTable: connectingFrom.tableId,
            fromColumn: connectingFrom.column,
            toTable: tableId,
            toColumn: columnName,
          };
          if (!isConnectionDuplicateOrNotValid(connections, newConnection)) {
            setConnections([...connections, newConnection]);
            saveTableRelationshipState(addedTables, [
              ...connections,
              newConnection,
            ]);
          }
        }
        setConnectingFrom(null);
        setMousePosition(null);
        setHoveredColumn(null);
      } else {
        // Start a new connection
        setConnectingFrom({ tableId, column: columnName });
      }
    },
    [connectingFrom, connections, addedTables, saveTableRelationshipState],
  );

  useEffect(() => {
    const handleMouseRightClick = (e: MouseEvent) => {
      if (connectingFrom) {
        e.preventDefault();
        handleStartConnection(connectingFrom.tableId, connectingFrom.column);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Escape") && connectingFrom) {
        e.preventDefault();
        handleStartConnection(connectingFrom.tableId, connectingFrom.column);
      }
    };

    window.addEventListener("contextmenu", handleMouseRightClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleMouseRightClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [connectingFrom, handleStartConnection]);

  const handleColumnHover = useCallback(
    (tableId: string, columnName: string) => {
      if (connectingFrom && connectingFrom.tableId !== tableId) {
        setHoveredColumn({ tableId, column: columnName });
      }
    },
    [connectingFrom],
  );

  const handleColumnLeave = useCallback(() => {
    setHoveredColumn(null);
  }, []);

  const getColumnPosition = useCallback(
    (tableId: string, columnName: string, left?: boolean) => {
      const table = addedTables.find((t) => t.id === tableId);
      if (!table) return null;

      const columnIndex = table.columns.findIndex((c) => c.name === columnName);
      if (columnIndex === -1) return null;

      // More accurate position calculation:
      // - Card header: 56px (p: 2 = 16px top + 16px bottom + content ~24px)
      // - Each column row: approximately 73px (p: 1.5 = 12px top + 12px bottom + content ~49px)
      // - We want to anchor to the right edge of the card, middle of the row
      const rowMiddleOffset = tableCardRowHeight / 2;
      const scrollOffset = cardColumnListRefs.current[tableId]?.scrollTop ?? 0;

      return {
        // Right edge of the 360px wide card
        x: table.position.x + canvaOffset + (left ? 0 : tableCardWidth),
        y: table.position.y + tableCardHeaderHeight +
          columnIndex * tableCardRowHeight +
          rowMiddleOffset + canvaOffset - scrollOffset,
      };
    },
    [addedTables],
  );

  useEffect(() => {
    if (draggingTable) {
      setForceUpdate((prev) => prev + 1);
    }
  }, [draggingTable, addedTables]);

  const targetTable = addedTables.find((t) => t.isTarget);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 80px)" }}>
      <EditAppBar />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.default",
          }}
        >
          <HeaderSection
            connections={connections}
            setSaveDialogOpen={setSaveDialogOpen}
            addedTables={addedTables}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            setAnchorEl={setAnchorEl}
            handleZoomIn={handleZoomIn}
            canvasTransform={canvasTransform}
            handleResetZoom={handleResetZoom}
            handleZoomOut={handleZoomOut}
          />

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden" }}>
            {/* Canvas Area */}
            <Box
              ref={canvasRef}
              sx={{
                flexGrow: 1,
                position: "relative",
                overflow: "hidden",
                bgcolor: "background.paper",
                cursor: isPanning
                  ? "grabbing"
                  : connectingFrom
                  ? "crosshair"
                  : "grab",
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleCanvasClick}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  transform:
                    `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                  transition: isPanning || draggingTable
                    ? "none"
                    : "transform 0.1s ease-out",
                }}
              >
                {/* Grid Background */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -canvaOffset,
                    left: -canvaOffset,
                    width: canvaSize,
                    height: canvaSize,
                    backgroundImage: `radial-gradient(circle, ${
                      alpha(theme.palette.primary.main, 0.2)
                    } ${
                      Math.pow(1 / canvasTransform.scale, 1.16)
                    }px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                    pointerEvents: "none",
                  }}
                />

                <svg
                  style={{
                    position: "absolute",
                    top: -canvaOffset,
                    left: -canvaOffset,
                    width: canvaSize,
                    height: canvaSize,
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  <defs>
                    <linearGradient
                      id="connectionGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                      // this resolve path disappear when path is straight line
                      // uses svg absolute coordinates
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#2196f3" stopOpacity="1" />
                      <stop offset="100%" stopColor="#64b5f6" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient
                      id="selectedGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#4caf50" stopOpacity="1" />
                      <stop offset="100%" stopColor="#81c784" stopOpacity="1" />
                    </linearGradient>
                    <filter id="glow" filterUnits="userSpaceOnUse">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="strongGlow" filterUnits="userSpaceOnUse">
                      <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {connections.map((conn) => {
                    let fromPos = getColumnPosition(
                      conn.fromTable,
                      conn.fromColumn,
                    );
                    let toPos = getColumnPosition(
                      conn.toTable,
                      conn.toColumn,
                    );

                    const fromPosComparison = getColumnPosition(
                      conn.fromTable,
                      conn.fromColumn,
                      true,
                    );
                    const toPosComparison = getColumnPosition(
                      conn.toTable,
                      conn.toColumn,
                      true,
                    );

                    if (
                      !fromPos || !toPos || !fromPosComparison ||
                      !toPosComparison
                    ) return null;

                    const d1 = Math.hypot(
                      fromPos.x - toPosComparison.x,
                      fromPos.y - toPosComparison.y,
                    );

                    const d2 = Math.hypot(
                      fromPosComparison.x - toPos.x,
                      fromPosComparison.y - toPos.y,
                    );

                    if (d1 < d2) {
                      toPos = toPosComparison;
                    } else {
                      fromPos = fromPosComparison;
                    }

                    const isHovered = hoveredConnection === conn.id;
                    const isSelected = selectedConnection === conn.id;
                    const pathData = (d1 < d2)
                      ? createCurvePath(
                        fromPos.x,
                        fromPos.y,
                        toPos.x,
                        toPos.y,
                      )
                      : createCurvePath(
                        toPos.x,
                        toPos.y,
                        fromPos.x,
                        fromPos.y,
                      );

                    return (
                      <g key={conn.id}>
                        <path
                          d={pathData}
                          stroke="transparent"
                          strokeWidth="40"
                          fill="none"
                          style={{ cursor: "pointer", pointerEvents: "stroke" }}
                          onMouseEnter={() => setHoveredConnection(conn.id)}
                          onMouseLeave={() => setHoveredConnection(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnectionClick(conn.id);
                          }}
                          onContextMenu={(e) =>
                            handleConnectionRightClick(
                              e as React.MouseEvent,
                              conn.id,
                            )}
                        />

                        {(isHovered || isSelected) && (
                          <path
                            d={pathData}
                            stroke={isSelected ? "#4caf50" : "#64b5f6"}
                            strokeWidth="10"
                            fill="none"
                            opacity="0.5"
                            filter={isSelected
                              ? "url(#strongGlow)"
                              : "url(#glow)"}
                            style={{ pointerEvents: "none" }}
                          />
                        )}

                        <path
                          d={pathData}
                          stroke={isSelected
                            ? "url(#selectedGradient)"
                            : isHovered
                            ? "#64b5f6"
                            : "url(#connectionGradient)"}
                          strokeWidth={isSelected
                            ? "5"
                            : isHovered
                            ? "4"
                            : "3.5"}
                          fill="none"
                          strokeLinecap="round"
                          style={{
                            pointerEvents: "none",
                            transition: "stroke-width 0.2s ease",
                          }}
                        />

                        <circle
                          cx={fromPos.x}
                          cy={fromPos.y}
                          r={isSelected ? "8" : isHovered ? "7" : "6"}
                          fill={isSelected
                            ? "#4caf50"
                            : isHovered
                            ? "#64b5f6"
                            : "#2196f3"}
                          stroke="#fff"
                          strokeWidth="2.5"
                          style={{
                            pointerEvents: "none",
                            transition: "r 0.2s ease, fill 0.2s ease",
                          }}
                        />
                        <circle
                          cx={toPos.x}
                          cy={toPos.y}
                          r={isSelected ? "8" : isHovered ? "7" : "6"}
                          fill={isSelected
                            ? "#4caf50"
                            : isHovered
                            ? "#64b5f6"
                            : "#2196f3"}
                          stroke="#fff"
                          strokeWidth="2.5"
                          style={{
                            pointerEvents: "none",
                            transition: "r 0.2s ease, fill 0.2s ease",
                          }}
                        />
                      </g>
                    );
                  })}

                  {connectingFrom &&
                    mousePosition &&
                    (() => {
                      let fromPos = getColumnPosition(
                        connectingFrom.tableId,
                        connectingFrom.column,
                      );

                      const fromPosComparison = getColumnPosition(
                        connectingFrom.tableId,
                        connectingFrom.column,
                        true,
                      );

                      if (!fromPos || !fromPosComparison) return null;

                      const mousePositionX = mousePosition.x + canvaOffset;
                      const mousePositionY = mousePosition.y + canvaOffset;

                      let toX = hoveredColumn
                        ? getColumnPosition(
                          hoveredColumn.tableId,
                          hoveredColumn.column,
                        )?.x || mousePositionX
                        : mousePositionX;
                      let toY = hoveredColumn
                        ? getColumnPosition(
                          hoveredColumn.tableId,
                          hoveredColumn.column,
                        )?.y || mousePositionY
                        : mousePositionY;

                      let d1 = 0, d2 = 1;

                      if (hoveredColumn) {
                        const toPosComparison = getColumnPosition(
                          hoveredColumn.tableId,
                          hoveredColumn.column,
                          true,
                        );
                        const toXComparison = toPosComparison?.x ||
                          mousePositionX;
                        const toYComparison = toPosComparison?.y ||
                          mousePositionY;

                        d1 = Math.hypot(
                          fromPos.x - toXComparison,
                          fromPos.y - toYComparison,
                        );

                        d2 = Math.hypot(
                          fromPosComparison.x - toX,
                          fromPosComparison.y - toY,
                        );

                        if (d1 < d2) {
                          toX = toXComparison;
                          toY = toYComparison;
                        } else {
                          fromPos = fromPosComparison;
                        }
                      }

                      const pathData = (d1 < d2)
                        ? createCurvePath(
                          fromPos.x,
                          fromPos.y,
                          toX,
                          toY,
                        )
                        : createCurvePath(
                          toX,
                          toY,
                          fromPos.x,
                          fromPos.y,
                        );

                      const isValidTarget = hoveredColumn !== null;

                      return (
                        <g>
                          <path
                            d={pathData}
                            stroke={isValidTarget ? "#4caf50" : "#ff9800"}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="10 5"
                            strokeLinecap="round"
                            opacity="0.9"
                            filter="url(#glow)"
                            style={{
                              pointerEvents: "none",
                              animation: "dash 1s linear infinite",
                            }}
                          />

                          <circle
                            cx={fromPos.x}
                            cy={fromPos.y}
                            r="6"
                            fill={isValidTarget ? "#4caf50" : "#ff9800"}
                            stroke="#fff"
                            strokeWidth="2.5"
                            style={{ pointerEvents: "none" }}
                          />

                          {isValidTarget && (
                            <circle
                              cx={toX}
                              cy={toY}
                              r="6"
                              fill="#4caf50"
                              stroke="#fff"
                              strokeWidth="2.5"
                              style={{ pointerEvents: "none" }}
                            />
                          )}

                          {!isValidTarget && (
                            <circle
                              cx={toX}
                              cy={toY}
                              r="4"
                              fill="#ff9800"
                              opacity="0.7"
                              style={{ pointerEvents: "none" }}
                            />
                          )}
                        </g>
                      );
                    })()}
                </svg>

                <style>
                  {`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -15;
                    }
                  }
                `}
                </style>

                {/* Table Cards */}
                {addedTables.map((table) => {
                  const tableConnectionCount = connections.filter(
                    (conn) =>
                      conn.fromTable === table.id || conn.toTable === table.id,
                  ).length;

                  return (
                    <Card
                      key={table.id}
                      data-table-card
                      sx={{
                        position: "absolute",
                        left: table.position.x,
                        top: table.position.y,
                        width: tableCardWidth,
                        cursor: draggingTable === table.id
                          ? "grabbing"
                          : "grab",
                        zIndex: draggingTable === table.id ? 10 : 2,
                        border: table.isTarget ? "2px solid" : "1px solid",
                        borderColor: table.isTarget
                          ? "secondary.main"
                          : "divider",
                        userSelect: "none",
                        boxShadow: draggingTable === table.id ? 6 : 2,
                        transition: draggingTable === table.id
                          ? "none"
                          : "box-shadow 0.2s ease",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, table.id)}
                    >
                      <CardContent
                        sx={{
                          p: 0,
                          ":last-child": {
                            p: 0,
                          },
                        }}
                      >
                        {/* Table Header */}
                        <Box
                          sx={{
                            p: 2,
                            height: tableCardHeaderHeight,
                            bgcolor: table.isTarget
                              ? "secondary.main"
                              : "background.default",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DragIndicator fontSize="small" />
                            <Typography variant="h6" fontWeight={600}>
                              {table.name}
                            </Typography>
                            {table.isTarget && (
                              <Chip
                                label="Target"
                                size="small"
                                sx={{
                                  bgcolor: "info.main",
                                  color: "primary.contrastText",
                                  height: 20,
                                  fontSize: 11,
                                }}
                              />
                            )}
                            {tableConnectionCount > 0 && (
                              <Chip
                                label={`${tableConnectionCount} link${
                                  tableConnectionCount !== 1 ? "s" : ""
                                }`}
                                size="small"
                                sx={{
                                  bgcolor: "info.main",
                                  color: "primary.contrastText",
                                  height: 20,
                                  fontSize: 11,
                                }}
                              />
                            )}
                          </Box>
                          <Box className="no-drag">
                            <IconButton
                              size="small"
                              onClick={() => handleSetTarget(table.id)}
                              sx={{ mr: 1 }}
                            >
                              {table.isTarget
                                ? <Star fontSize="small" />
                                : <StarBorder fontSize="small" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveTable(table.id)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Divider />

                        {/* Table Card Columns List */}
                        <Box
                          ref={(node) => {
                            cardColumnListRefs.current[table.id] =
                              node as HTMLDivElement;
                          }}
                          // sx={{ maxHeight: 300, overflow: "auto" }}
                        >
                          {table.columns.map((column) => {
                            const isHovered =
                              hoveredColumn?.tableId === table.id &&
                              hoveredColumn?.column === column.name;
                            const isConnecting =
                              connectingFrom?.tableId === table.id &&
                              connectingFrom?.column === column.name;

                            const hasConnection = connections.some(
                              (conn) =>
                                (conn.fromTable === table.id &&
                                  conn.fromColumn === column.name) ||
                                (conn.toTable === table.id &&
                                  conn.toColumn === column.name),
                            );

                            return (
                              <Box
                                key={column.name}
                                className="no-drag"
                                onMouseEnter={() =>
                                  handleColumnHover(table.id, column.name)}
                                onMouseLeave={handleColumnLeave}
                                sx={{
                                  p: 1.5,
                                  height: tableCardRowHeight,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: isHovered
                                    ? alpha(theme.palette.success.main, 0.4)
                                    : isConnecting
                                    ? alpha(theme.palette.warning.main, 0.4)
                                    : "transparent",
                                  ...((!isHovered && !isConnecting) &&
                                    {
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                    }),
                                  transition: "background-color 0.2s",
                                  borderLeft: hasConnection
                                    ? "3px solid"
                                    : "3px solid transparent",
                                  borderLeftColor: hasConnection
                                    ? "primary.main"
                                    : "transparent",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexGrow: 1,
                                  }}
                                >
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        color="info"
                                        size="small"
                                        checked={table.primaryKey ===
                                          column.name}
                                        onChange={() =>
                                          handleSetPrimaryKey(
                                            table.id,
                                            column.name,
                                          )}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight={500}
                                        >
                                          {column.name}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {column.type} • {column.sample}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                </Box>
                                <Tooltip
                                  title={isConnecting
                                    ? "Click target column to complete connection"
                                    : "Click to start creating a connection"}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleStartConnection(
                                        table.id,
                                        column.name,
                                      )}
                                    color={isConnecting
                                      ? "warning"
                                      : isHovered
                                      ? "success"
                                      : hasConnection
                                      ? "primary"
                                      : "default"}
                                    sx={{
                                      bgcolor: hasConnection
                                        ? alpha(theme.palette.info.main, 0.5)
                                        : "transparent",
                                    }}
                                  >
                                    <LinkIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            );
                          })}
                        </Box>

                        {/* Table Info */}
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "background.default",
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Primary Key: {table.primaryKey || "Not set"}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              {addedTables.length === 0 && <EmptyBlock />}
            </Box>

            {/* Preview Panel */}
            {showPreview && (
              <Box
                sx={{
                  width: "100%",
                  borderLeft: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Fused Data Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {targetTable
                      ? `Target: ${targetTable.name}`
                      : "No target table selected"}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
                  {connections.length > 0
                    ? (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Connections ({connections.length})
                        </Typography>
                        {connections.map((conn) => {
                          const fromTable = addedTables.find((t) =>
                            t.id === conn.fromTable
                          );
                          const toTable = addedTables.find((t) =>
                            t.id === conn.toTable
                          );
                          return (
                            <Card
                              key={conn.id}
                              sx={{ mb: 1, bgcolor: "background.default" }}
                            >
                              <CardContent
                                sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                              >
                                <Typography variant="body2">
                                  {fromTable?.name}.{conn.fromColumn} →{" "}
                                  {toTable?.name}.{conn.toColumn}
                                </Typography>
                              </CardContent>
                            </Card>
                          );
                        })}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom>
                          Sample Fused Data
                        </Typography>
                        <DynamicTable data={featureGenerated.data ?? []} />
                      </>
                    )
                    : (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Create connections between tables to see preview
                        </Typography>
                      </Box>
                    )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add Table Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {availableTables
          .filter((table) => !addedTables.some((t) => t.tableId === table.id))
          .map((table) => (
            <MenuItem
              key={table.id}
              onClick={() => handleAddTable(table)}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {table.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {table.columns.length} columns • {table.rows.toLocaleString()}
                  {" "}
                  rows
                </Typography>
              </Box>
            </MenuItem>
          ))}
        {availableTables.every((table) =>
          addedTables.some((t) => t.tableId === table.id)
        ) && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              All tables added
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Save Dataset Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Fused Dataset</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will create a new fused dataset based on your current
            configuration. The original tables will not be modified.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Configuration Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {addedTables.length} tables
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • {connections.length} connections
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Target: {targetTable?.name || "None"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            disabled={postFeatureGenerated.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              await postFeatureGenerated.mutateAsync(Number(fusion_id), {
                onSuccess(data) {
                  if (data.state === 0) {
                    setGeneralSnackbarData({
                      severity: "success",
                      open: true,
                      message: "Generate dataset successfully!",
                    });
                  } else {
                    setGeneralSnackbarData({
                      severity: "error",
                      open: true,
                      message: "Error occur when create dataset",
                    });
                  }
                  setSaveDialogOpen(false);
                },
                onError() {
                  setGeneralSnackbarData({
                    severity: "error",
                    open: true,
                    message: "Error occur when create dataset",
                  });
                  setSaveDialogOpen(false);
                },
              });
            }}
            disabled={postFeatureGenerated.isPending}
          >
            {postFeatureGenerated.isPending
              ? <CircularProgress color="info" size={20} />
              : "Generate Dataset"}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu
          ? { top: contextMenu.y, left: contextMenu.x }
          : undefined}
      >
        <MenuItem
          onClick={() => {
            if (contextMenu) {
              handleDeleteConnection(contextMenu.connectionId);
            }
          }}
          sx={{ color: "error.main", fontWeight: 500 }}
        >
          <Close sx={{ mr: 1, fontSize: 18 }} />
          Remove Connection
        </MenuItem>
        <MenuItem disabled sx={{ fontSize: 12, opacity: 0.6 }}>
          Or press Delete/Backspace
        </MenuItem>
      </Menu>

      <GeneralSnackbar
        open={generalSnackbarData.open}
        severity={generalSnackbarData.severity}
        onClose={() =>
          setGeneralSnackbarData({ ...generalSnackbarData, open: false })}
      >
        {generalSnackbarData.message}
      </GeneralSnackbar>
    </Box>
  );
}
