import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import CreateInstance from './pages/CreateInstance'
import ManageInstances from './pages/ManageInstances'
import GenericService from './pages/GenericService'
import VpcPage from './pages/VpcPage'
import IamPage from './pages/IamPage'
import CloudWatchPage from './pages/CloudWatchPage'
import DeveloperToolsPage from './pages/DeveloperToolsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Core */}
        <Route path="dashboard"        element={<Dashboard />} />
        <Route path="create-instance"  element={<CreateInstance />} />
        <Route path="manage-instances" element={<ManageInstances />} />

        {/* Compute */}
        <Route path="lambda"           element={<GenericService serviceKey="lambda" />} />
        <Route path="ecs"              element={<GenericService serviceKey="ecs" />} />
        <Route path="auto-scaling"     element={<GenericService serviceKey="auto-scaling" />} />

        {/* Storage */}
        <Route path="s3"               element={<GenericService serviceKey="s3" />} />

        {/* Database */}
        <Route path="rds"              element={<GenericService serviceKey="rds" />} />
        <Route path="dynamodb"         element={<GenericService serviceKey="dynamodb" />} />

        {/* Networking */}
        <Route path="vpc"              element={<VpcPage />} />
        <Route path="load-balancers"   element={<GenericService serviceKey="load-balancers" />} />
        <Route path="cloudfront"       element={<GenericService serviceKey="cloudfront" />} />
        <Route path="route53"          element={<GenericService serviceKey="route53" />} />

        {/* Developer Tools */}
        <Route path="developer-tools"  element={<DeveloperToolsPage />} />

        {/* Security */}
        <Route path="iam"              element={<IamPage />} />

        {/* Monitoring */}
        <Route path="cloudwatch"       element={<CloudWatchPage />} />

        {/* Messaging */}
        <Route path="sqs"              element={<GenericService serviceKey="sqs" />} />
        <Route path="sns"              element={<GenericService serviceKey="sns" />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
