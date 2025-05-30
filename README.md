
# Day Weaver  weaving your day, your goals, no stress. Let AI handle the mess.

[![GitHub stars](https://img.shields.io/github/stars/aryan6673/dayweaver?style=social)](https://github.com/aryan6673/dayweaver/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/aryan6673/dayweaver?style=social)](https://github.com/aryan6673/dayweaver/network/members)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

Day Weaver is an intelligent, AI-powered personal assistant designed to help you master your schedule, manage tasks, and enhance your productivity. Built with a modern tech stack, it offers a seamless and intuitive experience for planning and organizing your day.

**Project Link:** [github.com/aryan6673/dayweaver](https://github.com/aryan6673/dayweaver)

## ✨ Features

Day Weaver comes packed with features to help you stay organized and achieve your goals:

*   **🤖 AI-Powered Schedule Creation:** Describe your ideal day or goals in natural language, and let our AI craft a smart, segmented schedule with work and rest times.
*   **📝 Comprehensive Task Management:** Create, view, update, delete, and track your daily to-dos. Filter tasks by status, priority, and search terms.
*   **🧠 Intelligent Task Breakdown:** Input a large task and its deadline, and AI will break it down into manageable sub-tasks with estimated time allocations.
*   **🔄 Dynamic Task Reallocation:** Life happens! If you need to reschedule, tell AI the reason, provide your current tasks, and it will intelligently reallocate them to new slots.
*   **🎤 Meeting & Speech Preparation:** Input your calendar event and current tasks. AI will adjust your schedule, compress preparation times, and generate reminders and speaker checklists.
*   **📊 Productivity Analytics:**
    *   **Task Progress:** Visualize your task completion status with an intuitive pie chart.
    *   **Time Usage:** Understand how you spend your time across different activities with a weekly bar chart.
    *   **Efficiency Score:** Get a score based on task completion rates and deferments.
    *   **Burnout Predictor:** AI-driven insights into your work patterns to predict and help prevent burnout.
*   **Modern & Responsive UI:** Built with Next.js, React, ShadCN UI, and Tailwind CSS for a beautiful and accessible experience on all devices.

## 🛠️ Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Generative AI:** Google Gemini models via Genkit
*   **State Management:** React Hook Form, TanStack Query (React Query)
*   **Charting:** Recharts

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   npm or yarn

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/aryan6673/dayweaver.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd dayweaver
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```
4.  Set up your environment variables:
    Create a `.env.local` file in the root directory and add your Google AI API Key:
    ```env
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
    *You can obtain a Google API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).*
5.  Run the development server:
    ```sh
    npm run dev
    ```
    This will start the Next.js app (usually on `http://localhost:9002`) and the Genkit development server.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a PullRequest

## 📜 License

Distributed under the MIT License. See `LICENSE` file for more information. (Note: You'll need to add a LICENSE file to your repository - MIT is a good default for open source projects).

## 🏆 Acknowledgements & Ownership

This project, Day Weaver, is envisioned, developed, and maintained by **Aryan Singh ([@aryan6673](https://github.com/aryan6673))**. All credit for the concept and core development goes to him.

A big thank you to the open-source community for the tools and libraries that make projects like this possible!
