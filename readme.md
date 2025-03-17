# OnlineCodingJudge

## Introduction

**OnlineCodingJudge** is a web-based platform designed to provide users with coding challenges and an interactive environment to practice and improve their programming skills. It offers a variety of problems across different difficulty levels, allowing users to submit code solutions, receive immediate feedback. The platform supports multiple programming languages and a chatbot to communicate.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: SQL
- **Queue**: BullMq.js
- **WebSocket Communication**: Socket.io

## Running the Project

Follow these steps to set up and run the project locally:

### Prerequisites

- Node.js (Latest LTS version recommended)
- MongoDB (Installed and running locally or a remote MongoDB instance)
- Docker (For secure and isolated code execution)
- Git (For cloning the repository)

### Installation Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Vidit-Jain2206/OnlineCodingJudge.git
   cd OnlineCodingJudge
   ```

2. **Install Dependencies**:

   - For the root folder of the repository:

     ```bash
     npm install
     ```

   - For the frontend:
     ```bash
     cd ../frontend
     npm install
     ```

3. **Set Up Environment Variables**:

   - Create a `.env` file in both the `root-folder`, `worker`,`chat-bot`, `api-server` and `frontend` directories.
   - Specify the required environment variables as per your configuration.

4. **Start the Backend Server**:

   ```bash
   cd ../api-server
   npm run dev
   cd ../chat-bot
   npm run dev
   cd ../worker
   npm run dev
   cd ../websocket-server
   npm run dev

   ```

5. **Start the Frontend Server**:

   ```bash
   cd ../frontend
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage Examples

### Submitting a Solution

1. Write your code in the integrated code editor.
2. Click the "Submit" button to evaluate your code against all test cases.
3. View real-time feedback on correctness and efficiency.
4. Click on "ASK AI" button to activate the chat-bot.

## Contributing Guidelines

We welcome contributions! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature-branch-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add a new feature or fix a bug"
   ```
4. Push the branch to your forked repository:
   ```bash
   git push origin feature-branch-name
   ```
5. Open a Pull Request (PR) with a clear description of your changes.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
