import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Pagination,
  Card,
  CardMedia,
  Grid,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useRefresh } from '../../hooks/useRefresh';

interface DatasetImage {
  id: string;
  image_url: string;
  dataset: string;
  image: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DatasetImage[];
}



const ViewDatasetImages: React.FC = () => {
  const { datasetId } = useParams();
  const [images, setImages] = useState<DatasetImage[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { refresh } = useRefresh()

  const pageSize = 10;

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await axios.get<ApiResponse>('/services/api/dataset-image/', {
          params: { dataset: datasetId, page },
        });
        setImages(res.data.results);
        setCount(Math.ceil(res.data.count / pageSize));
      } catch (err) {
        console.error('Failed to fetch images:', err);
      }
      setLoading(false);
    };

    fetchImages();
  }, [datasetId, page, refresh]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box p={2}>
      <Box mb={2} display="flex" justifyContent="center">
        <Pagination count={count} page={page} onChange={handlePageChange} />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : images.length === 0 ? (
        <Typography align="center">No images found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {images.map((img) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={img.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={img.image_url}
                  alt={`Image ${img.id}`}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ViewDatasetImages;
