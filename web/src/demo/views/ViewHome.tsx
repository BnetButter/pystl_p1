import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import FlightIcon from "@mui/icons-material/Flight";
import PublicIcon from "@mui/icons-material/Public";

const HomePage: React.FC = () => {


  return (
    <Container>
      {/* Title and Description */}
      <Typography variant="h4" align="center" color="primary" gutterBottom sx={{ mt: 3 }}>
        Celery Web App Integration
      </Typography>
      <Typography variant="h5" align="center" color="primary" gutterBottom>
        PySTL
      </Typography>
      <Typography align="center" color="primary" paragraph>
        This application demonstrates how a basic integration between Celery that executes AI models with a web application.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} justifyContent="center" sx={{ px: 2 }}>
        {[{
          title: "Running Workers",
          value: `${0} Running Workers`,
          icon: <PeopleIcon fontSize="large" color="primary" />
        }, {
          title: "Completed Workers",
          value: `${0} Finished Workers`,
          icon: <FlightIcon fontSize="large" color="primary" />
        }, {
          title: "Error Workers",
          value: `${0} Error Workers`,
          icon: <PublicIcon fontSize="large" color="primary" />
        }].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <CardContent>
                <Tooltip title={item.title}>
                  <IconButton>{item.icon}</IconButton>
                </Tooltip>
                <Typography variant="h5" align="center">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Horizontal Divider */}
      <Divider sx={{ my: 4 }} />
    </Container>
  );
};

export default HomePage;
