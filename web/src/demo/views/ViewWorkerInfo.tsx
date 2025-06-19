import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Card,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import axios from "axios";

interface WorkerStatus {
  id: string;
  state: string;
  message: string;
  name: string;
}

const POLL_INTERVAL_MS = 1000;

const ViewWorkerInfo: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [worker, setWorker] = useState<WorkerStatus | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWorker = async () => {
    try {
      const res = await axios.get<WorkerStatus>(`/services/api/worker/${workerId}`);
      const { state, message } = res.data;
      setWorker(res.data);
      setLogs(message.split("\n").filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch worker info:", err);
    }
  };

  useEffect(() => {
    if (!workerId) return;

    fetchWorker();

    const poll = async () => {
      try {
        const res = await axios.get<WorkerStatus>(`/services/api/worker/${workerId}`);
        const data = res.data;
        setWorker(data);
        setLogs(data.message.split("\n").filter(Boolean));

        if (data.state !== "pending" && data.state !== "running") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [workerId]);

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "success":
        return <CheckCircleIcon color="success" />;
      case "failed":
        return <CancelIcon color="error" />;
      case "pending":
        return <PauseCircleIcon color="warning" />;
      case "running":
        return <AutorenewIcon color="primary" />;
      default:
        return null;
    }
  };

  const getCardBackgroundColor = (state: string) => {
    switch (state) {
      case "success":
        return "#d0f0c0"; // light green
      case "failed":
        return "#f8d7da"; // light red
      case "pending":
        return "#fff3cd"; // light yellow
      case "running":
        return "#d0e7ff"; // light blue
      default:
        return "#f5f5f5";
    }
  };

  if (!worker) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  const showSpinner = worker.state === "pending" || worker.state === "running";

  return (
    <Box p={4}>
      <Typography
        variant="h5"
        sx={{ mb: 1, wordBreak: "break-word" }}
      >
        Worker {worker.name}
      </Typography>
      <Paper sx={{ mb: 3 }}>
        <Box height={1} bgcolor="divider" />
      </Paper>
      {/* Status Box with background color */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          backgroundColor: getCardBackgroundColor(worker.state),
        }}
      >
        {getStatusIcon(worker.state)}
        <Typography variant="h6" fontWeight="bold">
          Status: {worker.state.toUpperCase()}
        </Typography>
        {showSpinner && <CircularProgress size={18} />}
      </Card>

      {/* Log Output */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          maxHeight: 400,
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Log Output:
        </Typography>
        <Stack
          spacing={0.5}
          component="pre"
          sx={{
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            textAlign: "left",
          }}
        >
          {logs.map((line, idx) => (
            <Typography key={idx} variant="body2">
              {line}
            </Typography>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ViewWorkerInfo;
