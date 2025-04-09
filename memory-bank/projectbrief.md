# VAME Desktop Project Brief

## Project Overview

VAME Desktop is a cross-platform desktop application that provides a graphical user interface (GUI) for the Variational Animal Motion Encoding (VAME) project. VAME is an open-source machine learning tool for behavioral segmentation and analyses of animal motion data.

## Core Requirements

1. **Reproducible Pipeline Execution**:
   - Each step of a VAME project must be run exactly once to ensure reproducibility.
   - Prevent accidental overwriting of data or results.

2. **Cross-Platform Compatibility**:
   - Support for Windows, macOS (both Intel and M-series), and Linux.
   - Consistent user experience across all platforms.

3. **Complete VAME Pipeline Integration**:
   - Expose all VAME functionality through the GUI.
   - Support for project creation, configuration, data alignment, training, evaluation, segmentation, and visualization.

4. **User-Friendly Interface**:
   - Intuitive navigation and workflow.
   - Clear visualization of results and project status.
   - Guided step-by-step process for VAME pipeline execution.

5. **Project Management**:
   - Create, load, configure, and delete VAME projects.
   - Track recent projects for quick access.
   - View project details and status.

## Project Scope

### In Scope

- Desktop application with Electron + React frontend and Python Flask backend.
- Complete VAME pipeline integration via REST API.
- Project management and configuration.
- Data visualization (UMAP, motif videos, community analysis).
- Cross-platform installers and distribution.
- Example data support for testing and demonstration.

### Out of Scope

- Modifications to the core VAME algorithm (handled by the `vame-py` library).
- Web-based or mobile versions of the application.
- Real-time data processing or streaming.
- Integration with other behavioral analysis tools (outside of VAME).

## Success Criteria

1. Users can successfully create and manage VAME projects through the GUI.
2. All VAME pipeline steps can be executed through the interface.
3. Results are correctly visualized and accessible.
4. The application runs reliably on all supported platforms.
5. The interface prevents users from accidentally overwriting data or results.

## Target Users

- Neuroscientists and researchers studying animal behavior.
- Lab technicians processing behavioral data.
- Students learning about behavioral segmentation and analysis.
- Anyone who wants to use VAME without command-line interaction.
