# PickleCloud

PickleCloud is a social platform designed to connect pickleball players, helping them find matches, locate courts, and chat with opponents. This prototype demonstrates the core functionality for P3c: Computer Prototype.

## Prerequisites

* **Python 3.7+** or higher must be installed on your machine.
* A modern web browser (Chrome, Firefox, Safari, or Edge).

## Installation & Setup

1.  **Unzip the project folder** (if you downloaded it as a zip) or clone this github repo in you IDE.
2.  **Open your terminal** 
3.  **Navigate to the project directory**:
    ```bash
    cd PickleCloud
    ```
4.  **Install the required Python packages**. Run the following command:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: If `requirements.txt` is missing, you can install the dependencies manually by running: `pip install fastapi uvicorn sqlalchemy pydantic`)*

## How to Run the Prototype

1.  Make sure you are inside the main `PickleCloud` folder in your terminal.
2.  Start the backend server by running:
    ```bash
    cd backend/
    ```
    ```bash
    uvicorn main:app --reload
    ```

3.  Once the server starts (you will see `Uvicorn running on http://127.0.0.1:8000`), open your web browser.
4.  Go to the following URL:
    **[http://localhost:8000](http://localhost:8000)**

## Supported Tasks

This prototype supports the following three user scenarios:

### Task 1: Select a Home Court (Navigable)
* **Goal:** View local courts and pick a preferred location.
* **How to test:**
    1. Click **"Account"** in the navigation bar.
    2. Scroll down to the "Select Home Court" section.
    3. Click on any court in the list (e.g., "Lincoln YMCA").

### Task 2: Find a Match (Navigable)
* **Goal:** Find an evenly matched opponent based on skill level.
* **How to test:**
    1. Go to the **"Home"** page.
    2. Click the green **"Join a Match"** button in the top right.
    3. Select a skill level and click **"Search Matches"**.
    4. Wait for the simulated loading screen.
    5. When the match is found, click **"Accept Match"**.

### Task 3: Chat with Opponent (Depth Feature)
* **Goal:** Coordinate game details with an opponent.
* **How to test:**
    1. After accepting a match in Task 2, you will be automatically redirected to the **Private Chats** page.
    2. The chat with **"Sarah J."** will open automatically.
    3. You can type messages in the input box and hit **Send**.
    4. **Note:** This feature uses a Python backend to store your messages in memory during the session, demonstrating high-fidelity interactivity.

## Project Structure

* **`backend/`**: Contains the Python logic (`main.py`) and database models.
* **`frontend/`**: Contains the HTML, CSS, and JavaScript files served by the backend.
* **`requirements.txt`**: Lists the Python dependencies.

## Troubleshooting

* **Port already in use**: If port 8000 is busy, run `uvicorn backend.main:app --reload --port 8001` and visit `localhost:8001`.