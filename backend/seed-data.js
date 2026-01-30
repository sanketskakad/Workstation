"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const dotenv_1 = require("dotenv");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/workstation-tasks';
// Define schemas inline for seeding
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: { type: String, unique: true, sparse: true },
    password: String,
    role: String,
    team: [String],
    createdAt: { type: Date, default: Date.now },
});
const projectSchema = new mongoose_1.default.Schema({
    name: String,
    teamObjective: String,
    details: String,
    ownerId: String,
    members: [String],
    createdAt: { type: Date, default: Date.now },
});
const sprintSchema = new mongoose_1.default.Schema({
    name: String,
    projectId: mongoose_1.default.Schema.Types.ObjectId,
    startDate: String,
    endDate: String,
    status: String,
    createdAt: { type: Date, default: Date.now },
});
const taskSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    status: String,
    priority: String,
    assignee: String,
    dueDate: String,
    project: String,
    projectId: mongoose_1.default.Schema.Types.ObjectId,
    sprintId: mongoose_1.default.Schema.Types.ObjectId,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now },
});
async function seedDatabase() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        const User = mongoose_1.default.model('User', userSchema, 'users');
        const Project = mongoose_1.default.model('Project', projectSchema, 'projects');
        const Sprint = mongoose_1.default.model('Sprint', sprintSchema, 'sprints');
        const Task = mongoose_1.default.model('Task', taskSchema, 'tasks');
        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            Sprint.deleteMany({}),
            Task.deleteMany({}),
        ]);
        console.log('Cleared existing data');
        // 1. CREATE USERS
        const hashedPassword = await bcrypt_1.default.hash('We@reDev9', 10);
        const users = await User.insertMany([
            {
                name: 'Sanket K',
                email: 'sanket@workstation.app',
                password: hashedPassword,
                role: 'Admin',
                team: ['Alpha', 'Beta'],
            },
            {
                name: 'Vyom K',
                email: 'vyom@workstation.app',
                password: hashedPassword,
                role: 'Admin',
                team: ['Alpha'],
            },
            {
                name: 'John Doe',
                email: 'john@workstation.app',
                password: hashedPassword,
                role: 'Project Manager',
                team: ['Alpha'],
            },
            {
                name: 'Lina Chen',
                email: 'lina@workstation.app',
                password: hashedPassword,
                role: 'Developer',
                team: ['Alpha'],
            },
            {
                name: 'Marcus Patel',
                email: 'marcus@workstation.app',
                password: hashedPassword,
                role: 'Developer',
                team: ['Alpha'],
            },
            {
                name: 'Jane Smith',
                email: 'jane@workstation.app',
                password: hashedPassword,
                role: 'Project Manager',
                team: ['Beta'],
            },
            {
                name: 'David Kim',
                email: 'david@workstation.app',
                password: hashedPassword,
                role: 'Developer',
                team: ['Beta'],
            },
            {
                name: 'Sarah Johnson',
                email: 'sarah@workstation.app',
                password: hashedPassword,
                role: 'Developer',
                team: ['Beta'],
            },
        ]);
        console.log(`Created ${users.length} users`);
        // 2. CREATE PROJECTS
        const mobileApp = await Project.create({
            name: 'Mobile App Redesign',
            teamObjective: 'Modernize the user interface and improve performance for the flagship iOS/Android application.',
            details: 'Focus on dark mode support and accessibility compliance.',
            ownerId: 'sanket@workstation.app',
            members: ['sanket@workstation.app', 'john@workstation.app', 'lina@workstation.app', 'marcus@workstation.app'],
        });
        const cloudMigration = await Project.create({
            name: 'Cloud Migration Phase 2',
            teamObjective: 'Migrate monolithic services to AWS EKS clusters.',
            details: 'Reduce hosting costs by 30% through containerization.',
            ownerId: 'vyom@workstation.app',
            members: ['vyom@workstation.app', 'jane@workstation.app', 'david@workstation.app', 'sarah@workstation.app'],
        });
        const apiGateway = await Project.create({
            name: 'API Gateway Enhancement',
            teamObjective: 'Build unified API layer with improved rate limiting and authentication.',
            details: 'Support OAuth 2.0 and implement GraphQL federation.',
            ownerId: 'john@workstation.app',
            members: ['john@workstation.app', 'lina@workstation.app', 'marcus@workstation.app'],
        });
        console.log('Created 3 projects');
        // 3. CREATE SPRINTS
        // Previous sprint (finished)
        const prevSprint1 = await Sprint.create({
            name: 'Sprint 1 (April 1-14)',
            projectId: mobileApp._id,
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
        });
        // Current sprint
        const mobileSprint = await Sprint.create({
            name: 'Sprint 2 (April 15-28)',
            projectId: mobileApp._id,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        });
        const cloudSprint = await Sprint.create({
            name: 'Infrastructure Q2 (April-June)',
            projectId: cloudMigration._id,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        });
        const apiSprint = await Sprint.create({
            name: 'API Sprint 3 (April 8-21)',
            projectId: apiGateway._id,
            startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
        });
        console.log('Created 4 sprints');
        // 4. CREATE TASKS WITH HISTORICAL DATA FOR ANALYTICS
        const baseDate = new Date();
        const tasksList = [];
        // Previous Sprint Tasks (mostly completed)
        for (let week = 3; week <= 4; week++) {
            const weekStart = new Date(baseDate.getTime() - (15 - week * 7) * 24 * 60 * 60 * 1000);
            const weekTasks = [
                {
                    title: `Setup UI Component Library - Week ${week}`,
                    description: 'Create reusable component system for mobile app.',
                    status: 'done',
                    priority: 'high',
                    assignee: 'Lina Chen',
                    dueDate: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: mobileApp.name,
                    projectId: mobileApp._id,
                    sprintId: prevSprint1._id,
                    completedAt: new Date(weekStart.getTime() + 3 * 24 * 60 * 60 * 1000),
                },
                {
                    title: `Implement Dark Mode Theme - Week ${week}`,
                    description: 'Create Tailwind CSS theme for dark mode support.',
                    status: 'done',
                    priority: 'high',
                    assignee: 'Marcus Patel',
                    dueDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: mobileApp.name,
                    projectId: mobileApp._id,
                    sprintId: prevSprint1._id,
                    completedAt: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
                },
                {
                    title: `Database Schema Optimization - Week ${week}`,
                    description: 'Optimize MongoDB indexes for better query performance.',
                    status: 'done',
                    priority: 'medium',
                    assignee: 'David Kim',
                    dueDate: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: cloudMigration.name,
                    projectId: cloudMigration._id,
                    sprintId: cloudSprint._id,
                    completedAt: new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000),
                },
                {
                    title: `API Authentication Module - Week ${week}`,
                    description: 'Implement JWT-based authentication for API gateway.',
                    status: 'done',
                    priority: 'high',
                    assignee: 'Lina Chen',
                    dueDate: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: apiGateway.name,
                    projectId: apiGateway._id,
                    sprintId: apiSprint._id,
                    completedAt: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000),
                },
                {
                    title: `Code Review and Testing - Week ${week}`,
                    description: 'Comprehensive testing and code review process.',
                    status: 'done',
                    priority: 'medium',
                    assignee: 'Sarah Johnson',
                    dueDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    project: cloudMigration.name,
                    projectId: cloudMigration._id,
                    sprintId: cloudSprint._id,
                    completedAt: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
                },
            ];
            tasksList.push(...weekTasks);
        }
        // Current Sprint Tasks (mix of statuses)
        const currentWeekStart = new Date();
        const currentTasks = [
            {
                title: 'Finalize product launch messaging',
                description: 'Align the launch narrative with sales and marketing goals.',
                status: 'done',
                priority: 'high',
                assignee: 'John Doe',
                dueDate: new Date(currentWeekStart.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: mobileApp.name,
                projectId: mobileApp._id,
                sprintId: mobileSprint._id,
                completedAt: new Date(currentWeekStart.getTime() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                title: 'Implement Dark Mode Theme',
                description: 'Create Tailwind CSS theme for dark mode support.',
                status: 'inprogress',
                priority: 'high',
                assignee: 'Marcus Patel',
                dueDate: new Date(currentWeekStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: mobileApp.name,
                projectId: mobileApp._id,
                sprintId: mobileSprint._id,
            },
            {
                title: 'Fix Navigation Lag',
                description: 'Identify and resolve the bottleneck in the main navigation transitions.',
                status: 'todo',
                priority: 'medium',
                assignee: 'David Kim',
                dueDate: new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: mobileApp.name,
                projectId: mobileApp._id,
                sprintId: mobileSprint._id,
            },
            {
                title: 'Setup Monitoring and Logging',
                description: 'Configure CloudWatch and ELK stack for production monitoring.',
                status: 'inprogress',
                priority: 'high',
                assignee: 'Sarah Johnson',
                dueDate: new Date(currentWeekStart.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: cloudMigration.name,
                projectId: cloudMigration._id,
                sprintId: cloudSprint._id,
            },
            {
                title: 'Implement Rate Limiting',
                description: 'Add sophisticated rate limiting to API gateway.',
                status: 'inprogress',
                priority: 'medium',
                assignee: 'Lina Chen',
                dueDate: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: apiGateway.name,
                projectId: apiGateway._id,
                sprintId: apiSprint._id,
            },
            {
                title: 'Create API Documentation',
                description: 'Complete API documentation using OpenAPI 3.0 specification.',
                status: 'todo',
                priority: 'medium',
                assignee: 'John Doe',
                dueDate: new Date(currentWeekStart.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                project: apiGateway.name,
                projectId: apiGateway._id,
                sprintId: apiSprint._id,
            },
        ];
        tasksList.push(...currentTasks);
        const tasks = await Task.insertMany(tasksList);
        console.log(`Created ${tasks.length} tasks with historical data`);
        // Summary
        console.log('\n=== SEED DATA SUMMARY ===');
        console.log(`Users created: ${users.length}`);
        console.log(`Projects created: 3`);
        console.log(`Sprints created: 4`);
        console.log(`Tasks created: ${tasks.length}`);
        console.log('\nDemo Credentials:');
        console.log('- Email: sanket@workstation.app (Admin)');
        console.log('- Email: john@workstation.app (Project Manager)');
        console.log('- Email: lina@workstation.app (Developer)');
        console.log('- Password: We@reDev9 (all users)');
        console.log('\n=== ANALYTICS DATA ===');
        console.log('Tasks completed in previous sprint: 10');
        console.log('Tasks in progress: 3');
        console.log('Tasks pending: 2');
        console.log('Team members: 8');
        console.log('Projects: 3 (with 4 active sprints)');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}
seedDatabase();
