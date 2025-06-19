import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Container,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useSnackbar } from '../../hooks/useSnackBar';
import { useRefresh } from '../../hooks/useRefresh';
import { useModalStack } from "../../hooks/useModalStack";

interface AddWorkerModalProps {
  onSubmit: () => void;
  datasetId: string
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ onSubmit, datasetId }) => {
  const [jobName, setJobName] = useState("");
  const { popModal } = useModalStack();
  const { setMessageSnack } = useSnackbar();

  const handleSubmit = async () => {
    if (!jobName.trim()) return;

    try {
      await axios.post("/services/api/worker/aecifnet/", { name: jobName, datasetId});
      setMessageSnack("Successfully started job with AECIF-NET", "success");
    } catch (err) {
      setMessageSnack("Failed to start job with AECIF-NET Worker", "error")
    }
    onSubmit();
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

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={popModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Add
          </Button>
        </Stack>
      </Stack>
  );
};


const DatasetUploadView: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const { datasetId } = useParams();
  const { setMessageSnack } = useSnackbar();
  const { refresh, setRefresh } = useRefresh();
  const { pushModal, popModal } = useModalStack();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const handleDelete = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleTrigger = () => {
    pushModal("Trigger Worker", <AddWorkerModal onSubmit={popModal} datasetId={datasetId}></AddWorkerModal>)
  }

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('dataset_id', datasetId || '');
    files.forEach((file) => formData.append('images', file));

    axios.post('/services/api/upload-images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        setFiles([]);
        setMessageSnack("Upload Success", "success");
        setRefresh(!refresh);
      })
      .catch(error => {
        console.error('Upload failed:', error);
        setMessageSnack("Upload failed", "error")

      });
  };


  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload to Dataset
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button variant="outlined" component="label">
          Upload
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={files.length === 0}>
          Submit
        </Button>
        
        <Button variant="contained" color="primary" onClick={handleTrigger} >
          Trigger Worker
        </Button>
      </Stack>

      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: 2,
          p: 2,
        }}
      >
        <List>
          {files.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar variant="square" src={URL.createObjectURL(file)}>
                  <ImageIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default DatasetUploadView;
