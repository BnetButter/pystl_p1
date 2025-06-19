import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Pagination,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MemoryIcon from "@mui/icons-material/Memory";
import { useNavigate } from "react-router-dom";
import { useModalStack } from "../../hooks/useModalStack";
import { useSnackbar } from "../../hooks/useSnackBar";

interface AddWorkerModalProps {
  onSubmit: () => void;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ onSubmit }) => {
  const [jobName, setJobName] = useState("");
  const { popModal } = useModalStack();
  const { setMessageSnack } = useSnackbar();

  const handleSubmit = async () => {
    if (!jobName.trim()) return;

    try {
      await axios.post("/services/api/worker/mock/", { name: jobName,  });
      setMessageSnack("Successfully started job with Mock Worker", "success");
      onSubmit();
    } catch (err) {
      setMessageSnack("Failed to start job with Mock Worker", "error")
    }
    popModal();
  };

  return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Add New Job
        </Typography>
        <TextField
          label="Job Name"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          fullWidth
          autoFocus
        />
        <Typography color="error" fontSize="0.875rem">
          This dialogue only starts the Mock Worker for testing purposes
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={popModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Add
          </Button>
        </Stack>
      </Stack>
  );
};

interface Worker {
  id: string;
  name: string;
}

const WorkerView: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { pushModal } = useModalStack();
  const { setMessageSnack } = useSnackbar();

  const navigate = useNavigate();
  const workersPerPage = 10;

  const fetchWorkers = async (page: number) => {
    try {
      const response = await axios.get("/services/api/worker", {
        params: { page_size: workersPerPage,  page },
      });
      const data = response.data;
      setWorkers(data.results.map((w: any) => ({ id: w.id, name: w.name })));
      setTotalCount(data.count);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
    }
  };

  useEffect(() => {
    fetchWorkers(page);
  }, [page]); 

  const handleAddJob = () => pushModal("Add Worker", <AddWorkerModal onSubmit={() => fetchWorkers(page)}/>)

  const handleDelete = useCallback((id: string) => {
    // Implement DELETE API if needed
    axios.delete(`/services/api/worker/${id}/`)
      .then(() => {
        setMessageSnack("Deleted worker", "success");
        fetchWorkers(page)
      })
      .catch(() => {
        setMessageSnack("Failed to delete worker", "error")

      });
  }, [page]);

  const handleSelect = (id: string) => {
    navigate(`/worker/${id}`);
  };


  const totalPages = Math.ceil(totalCount / workersPerPage);

  return (
    <Box p={2}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Worker
        </Typography>
        <IconButton color="primary" onClick={handleAddJob}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mb={2}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>

      {/* Worker Cards */}
      {workers.map((worker) => (
        <Card key={worker.id} variant="outlined" sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <MemoryIcon sx={{ m: 2 }} />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ cursor: "pointer" }}
              onClick={() => handleSelect(worker.id)}
            >
              {worker.name}
            </Typography>
          </CardContent>
          <CardActions>
            <IconButton color="error" onClick={() => handleDelete(worker.id)}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </Card>
      ))}      
    </Box>
  );
};

export default WorkerView;
