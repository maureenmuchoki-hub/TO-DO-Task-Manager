const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health Check & Monitoring Endpoint
// @access  Public
router.get('/', async (req, res) => {
  try {

    // Calculate memory usage
    const memoryUsage = process.memoryUsage();

    // Build detailed health check response
    const healthcheck = {
      status: 'ok',
      message: 'TO-DO Task Manager API is running successfully',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: {
          heapUsed: `${Math.round(
            memoryUsage.heapUsed / 1024 / 1024
          )} MB`,
          heapTotal: `${Math.round(
            memoryUsage.heapTotal / 1024 / 1024
          )} MB`,
        },
      },
      endpoints: {
        getTasks: 'GET /tasks',
        createTask: 'POST /tasks',
        updateTask: 'PUT /tasks/:id',
        deleteTask: 'DELETE /tasks/:id',
      },
    };

    // Return success response
    res.status(200).json(healthcheck);

  } catch (error) {

    // Return error response
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

module.exports = router;
