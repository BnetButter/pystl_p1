import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";
import axios from "axios";

interface WorkerResponse {
  id: string;
  state: "pending" | "success" | "failed";
  error: string | null;
  result: string[];
  message: string;
  name: string;
  input_params: any;
  type: string;
}

const ViewResult: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [data, setData] = useState<WorkerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const imagesPerPage = 12;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const response = await axios.get<WorkerResponse>(
          `/services/api/worker/${workerId}/`
        );
        if (response.data.state === "success" || response.data.state === "failed") {
          setData(response.data);
          setLoading(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error polling worker:", error);
        clearInterval(interval);
        setLoading(false);
      }
    };

    interval = setInterval(fetchData, 2000); // Poll every 2 seconds
    fetchData(); // Initial call

    return () => clearInterval(interval);
  }, [workerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (data?.state === "failed") {
    return (
      <Typography color="error" align="center" mt={4}>
        Failed to load image results.
      </Typography>
    );
  }

  if (data?.state === "success" && data?.type === "aecifnet") {
    const totalPages = Math.ceil(data.result.length / imagesPerPage);
    const displayedImages = data.result.slice(
      (page - 1) * imagesPerPage,
      page * imagesPerPage
    );

    return (
      <Box p={2}>
        <Typography variant="h5" gutterBottom>
          {data.name}
        </Typography>

        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
        <Grid container spacing={2}>
          {displayedImages.map((img, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <img
                src={`/services${img}`}
                alt={`Image ${index}`}
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Grid>
          ))}
        </Grid>

      </Box>
    );
  }

  return null;
};

export default ViewResult;
