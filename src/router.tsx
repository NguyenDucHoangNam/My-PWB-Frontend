import { Route, Routes, useLocation } from "react-router-dom";
import PortfolioPage from "./pages/PortfolioPage";
import CreateProjectPage from "./pages/producer/CreateProjectPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import MilestoneDetailsPage from "./pages/producer/MilestoneDetailsPage";
import UserProfile from "./pages/user/UserProfile";
import ProducerList from "./pages/ProducerList";
import UpdateProducer from "./pages/user/UpdateProducer";
import ComplaintList from "./pages/ComplaintList";
import ContractManager from "./pages/ContractManage";
import ContractDetail from "./pages/ContractDetail";
import CreateContractPage from "./pages/producer/CreateContractPage";
import SplitSheetPage from "./pages/producer/SplitSheetPage";
import ProjectManage from "./pages/ProjectManage";
import LoadingPage from "./component/loading/LoadingPage";
import { ROUTER } from "./routes/router";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/SignUpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import FallingMusicNotes from "./component/music";
import HomePage from "./pages/HomePage";
import MasterLayout from "./pages/theme/MasterLayout";
import HeatmapFeedbackPage from "./pages/HeatmapFeedbackPage";
import Instruct from "./pages/Instruct";

const RenderUserRouter = () => {
  const location = useLocation();
  const { pathname } = location;
  const shownotes: string[] = [ROUTER.USER.SETTING];
  return (
    <div>
      {shownotes.includes(pathname) && <FallingMusicNotes />}
      <Routes>
        <Route element={<MasterLayout />}>
          <Route path={ROUTER.USER.HOMEPAGE} element={<HomePage />} />

          <Route path={ROUTER.USER.PORTFOLIO} element={<PortfolioPage />} />
          <Route path={ROUTER.USER.PROJECTMANAGE} element={<ProjectManage/>} />
          <Route
            path={ROUTER.USER.CREATEPROJECT}
            element={<CreateProjectPage />}
          />
          <Route
            path={ROUTER.USER.PROJECTDETAIL}
            element={<ProjectDetailsPage />}
          />
          <Route
            path={ROUTER.USER.MILESTONE}
            element={<MilestoneDetailsPage />}
          />

          <Route path={ROUTER.USER.PROFILE} element={<UserProfile />} />
          <Route path={ROUTER.USER.PRODUCERLIST} element={<ProducerList />} />
          <Route
            path={ROUTER.USER.UPDATEPRODUCER}
            element={<UpdateProducer />}
          />
          <Route path={ROUTER.USER.COMPLAINTLIST} element={<ComplaintList />} />
          <Route
            path={ROUTER.USER.CONTRACTMANAGE}
            element={<ContractManager />}
          />
          <Route
            path={ROUTER.USER.CONTRACTDETAIL}
            element={<ContractDetail />}
          />
          <Route path={ROUTER.USER.CONTRACT} element={<CreateContractPage />} />
          <Route path={ROUTER.USER.SPLITMONEY} element={<SplitSheetPage />} />
          <Route path={ROUTER.USER.LOADINGPAGE} element={<LoadingPage />} />
          <Route path={ROUTER.USER.INSTRUCT} element={<Instruct />} />
          <Route path={ROUTER.USER.HEATMAP} element={<HeatmapFeedbackPage />} />
        </Route>  
        <Route path={ROUTER.USER.LOGIN} element={<LoginPage />} />
        <Route path={ROUTER.USER.SIGNUP} element={<SignUpPage />} />
        <Route
          path={ROUTER.USER.RESETPASSWORD}
          element={<ResetPasswordPage />}
        />
      </Routes>
    </div>
  );
};
const RouterCustom = () => {
  return RenderUserRouter();
};

export default RouterCustom;
