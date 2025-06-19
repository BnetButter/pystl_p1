import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Grid,
  Button,
  Container,
  Box,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useModalStack } from '../../hooks/useModalStack';
import { useSnackbar } from '../../hooks/useSnackBar';

interface Dataset {
  id: string;
  name: string;
  image_count: number;
}

const ViewDataset: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10; // Adjust as needed
  const navigate = useNavigate();
  const { pushModal, popModal } = useModalStack();
  const { setMessageSnack } = useSnackbar();

  const callDatasets = () => {
    axios.get(`/services/api/datasets/?page=${page}`)
      .then(response => {
        setDatasets(response.data.results);
        setCount(response.data.count);
      })
      .catch(error => {
        console.error('Failed to fetch datasets:', error);
      });
  };

  useEffect(() => {
    callDatasets();
  }, [page]);

  const totalPages = Math.ceil(count / pageSize);

  const handleCardClick = (id: string) => {
    navigate(`/datasets/${id}`);
  };

  const handleDelete = (id: string) => {
    axios.delete(`/services/api/datasets/${id}/`)
      .then(() => {
        setDatasets(prev => prev.filter(dataset => dataset.id !== id));
      })
      .catch(error => {
        console.error('Failed to delete dataset:', error);
      });
  };

  const handleCreateClick = () => {
    pushModal(
      "Create Dataset",
      <CreateDatasetForm
        onClose={() => {
          popModal();
          callDatasets();
          setMessageSnack("Created new dataset", "success");
        }}
      />
    );
  };

  return (
    <Container sx={{ paddingY: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Datasets</Typography>
        <IconButton color="primary" onClick={handleCreateClick}>
          <AddIcon />
        </IconButton>
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>

      <Grid container spacing={3}>
        {datasets.map(dataset => (
          <Grid item xs={12} sm={6} md={4} key={dataset.id}>
            <Card
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => handleCardClick(dataset.id)}
            >
              <CardContent>
                <Typography variant="h6">{dataset.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Image Count: {dataset.image_count}
                </Typography>
              </CardContent>
              <CardActions sx={{ position: 'absolute', top: 0, right: 0 }}>
                <IconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(dataset.id);
                  }}
                >
                  <DeleteIcon color="error" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

const CreateDatasetForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('');
  const { setMessageSnack } = useSnackbar();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('/services/api/datasets/', { name })
      .then(() => {
        onClose();
      })
      .catch(error => {
        setMessageSnack("Failed to create dataset", "error")
      });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} p={2}>
      <TextField
        label="Dataset Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button type="submit" variant="contained" color="primary">
          Create
        </Button>
      </Box>
    </Box>
  );
};

export default ViewDataset;
