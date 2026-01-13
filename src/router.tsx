import { Route, Routes, useLocation } from "react-router-dom";
import UserProfile from "./pages/user/UserProfile";
import ComplaintList from "./pages/ComplaintList";
import CreateContractPage from "./pages/contract/CreateContractPage";
import SplitSheetPage from "./pages/producer/SplitSheetPage";
import LoadingPage from "./component/loading/LoadingPage";
import { ROUTER } from "./routes/router";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/SignUpPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import GoogleCallback from "./pages/auth/GoogleCallback";
import FallingMusicNotes from "./component/music";
import MasterLayout from "./pages/theme/themeUser/MasterLayout";
import HeatmapFeedbackPage from "./pages/HeatmapFeedbackPage";
import FindProducerPage from "./pages/producer/ListProducerPage";
import ProPackagePage from "./pages/proPackage/ProPackagePage";
import ManageSubscriptionPage from "./pages/proPackage/ManageSubscriptionPage";
import SubscriptionReturnPage from "./pages/proPackage/SubscriptionReturnPage";
import ContractPaymentReturnPage from "./pages/contract/ContractPaymentReturnPage";
import TerminationPaymentReturnPage from "./pages/contract/termination/TerminationPaymentReturnPage";
import PaymentReturnWrapper from "./pages/contract/PaymentReturnWrapper";
import ProjectWorkspacePage from "./pages/workspace/overview/WorksapcePage";
import InspirationBoardPage from "./pages/workspace/InspirationBoardPage";
import AddendumListPage from "./pages/workspace/addendum/AddendumListPage";
import CreateAddendumPage from "./pages/workspace/addendum/CreateAddendumPage";
import AddendumSpacePage from "./pages/workspace/addendum/AddendumSpacePage";
import UserManagement from "./pages/admin/UserManagement";
import AdminLayout from "./pages/theme/themeAdmin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import WithdrawalsPage from "./pages/admin/WithdrawalsPage";
import RankManagementPage from "./pages/admin/RankManagementPage";
import ProducerPackagePage from "./pages/admin/ProducerPackagePage";
import PackageHistoryPage from "./pages/admin/PackageHistoryPage";
import AdvertisementManagementPage from "./pages/admin/AdvertisementManagementPage";
import UserGuideManagement from "./pages/admin/UserGuideManagement";
import MyInvitationsPage from "./pages/project/MyInvitationsPage";
import TeamInvitationPage from "./pages/project/TeamInvitationPage";
import ProjectDashboardPage from "./pages/project/ProjectDetailPage";
import ContractSpacePage from "./pages/contract/ContractSpacePage";
import ContractTerminationPage from "./pages/contract/ContractTerminationPage";
import CreateProjectPage from "./pages/project/CreateProjectPage";
import MyProjectsPage from "./pages/project/ProjectManagePage";
import NotFoundPage from "./pages/NotFoundPage";
import AboutUs from "./pages/AboutUS";
import HomePage from "./pages/HomePage";

import LiveSessionTest from "./pages/project/LiveSessionTest";
import LiveSessionList from "./pages/project/LiveSessionList";
import LiveSessionRoom from "./pages/project/LiveSessionRoom";
import UpdatePortfolioPage from "./pages/portfolio/UpdatePortfolioPage";
import ProjectWorkspaceDetailPage from "./pages/workspace/detail/ProjectWorkspaceDetailPage";
import InternalStudioPage from "./pages/workspace/InternalStudio/InternalStudioPage";
import ClientRoomPage from "./pages/workspace/clientRoom/ClientRoomPage";
import TrackDetailPage from "./pages/workspace/track/TrackDetailPage";
import AdminRoute from "./routes/AdminRoute";
import LyricsSuggestionPage from "./pages/workspace/track/LyricsSuggestionPage";
import PortfolioPage from "./pages/producer/PortfolioPage";
import ProducerPortfolioPage from "./pages/producer/ProducerPortfolioPage";
import AIDemoPage from "./pages/AIDemoPage";
import { DescriptionPage } from "./pages/project/DescriptionPage";
import VerifyCccdPage from "./pages/user/VerifyCccdPage";
import TicketsPage from "./pages/ticket/TicketsPage";
import MyTicketsPage from "./pages/ticket/MyTicketsPage";
import AdminTicketsPage from "./pages/admin/AdminTicketsPage";
import WithdrawalPage from "./pages/user/WithdrawalPage";
import ProjectExpenseStatisticsPage from "./pages/project/ProjectExpenseStatisticsPage";
import FinancePage from "./pages/user/FinancePage";
import TaxPage from "./pages/user/TaxPage";
import TaxAdminPage from "./pages/admin/tax/TaxAdminPage";

const RenderUserRouter = () => {
  const location = useLocation();
  const { pathname } = location;
  const shownotes: string[] = [ROUTER.USER.SETTING];

  return (
    <div>
      {shownotes.includes(pathname) && <FallingMusicNotes />}
      <Routes>
        <Route path={ROUTER.USER.LOGIN} element={<LoginPage />} />
        <Route path={ROUTER.USER.SIGNUP} element={<SignUpPage />} />
        <Route
          path={ROUTER.USER.RESETPASSWORD}
          element={<ResetPasswordPage />}
        />
        <Route
          path={ROUTER.USER.GOOGLE_CALLBACK}
          element={<GoogleCallback />}
        />

        <Route
          path={ROUTER.USER.LIVESESSIONROOM}
          element={<LiveSessionRoom />}
        />
        <Route path="/test-live-session" element={<LiveSessionTest />} />
        <Route path="/ai-demo" element={<AIDemoPage />} />

        <Route element={<MasterLayout />}>
          <Route path={ROUTER.USER.HOMEPAGE} element={<HomePage />} />
          <Route
            path={ROUTER.USER.PRODUCERLIST}
            element={<FindProducerPage />}
          />

          {/* Project Management */}
          <Route
            path={ROUTER.PRODUCER.CREATEPROJECT}
            element={<CreateProjectPage />}
          />
          <Route
            path={ROUTER.USER.PROJECTDETAIL}
            element={<ProjectDashboardPage />}
          />
          <Route
            path={ROUTER.USER.CONTRACTSPACE}
            element={<ContractSpacePage />}
          />
          <Route
            path={ROUTER.USER.CONTRACT_TERMINATION}
            element={<ContractTerminationPage />}
          />
          <Route
            path={ROUTER.USER.TEAMINVITATION}
            element={<TeamInvitationPage />}
          />
          <Route
            path={ROUTER.USER.MYINVITATIONS}
            element={<MyInvitationsPage />}
          />

          {/* Workspace */}

          <Route
            path={ROUTER.USER.WORKSPACE}
            element={<ProjectWorkspacePage />}
          />
          <Route
            path={ROUTER.USER.INSPIRATION}
            element={<InspirationBoardPage />}
          />
          <Route
            path={ROUTER.USER.ADDENDUM_LIST}
            element={<AddendumListPage />}
          />
          <Route
            path={ROUTER.USER.CREATE_ADDENDUM}
            element={<CreateAddendumPage />}
          />
          <Route
            path={ROUTER.USER.ADDENDUM_SPACE}
            element={<AddendumSpacePage />}
          />

          <Route
            path={ROUTER.USER.LIVESESSIONS}
            element={<LiveSessionList />}
          />

          <Route path={ROUTER.USER.PROFILE} element={<UserProfile />} />

          <Route path={ROUTER.USER.COMPLAINTLIST} element={<ComplaintList />} />

          <Route path={ROUTER.USER.PORTFOLIO} element={<PortfolioPage />} />
          <Route
            path={ROUTER.USER.VIEW_PORTFOLIO_BY_SLUG}
            element={<PortfolioPage />}
          />
          <Route
            path={ROUTER.USER.VIEW_PORTFOLIO}
            element={<PortfolioPage />}
          />
          <Route
            path={ROUTER.USER.UPDATE_PORTFOLIO}
            element={<UpdatePortfolioPage />}
          />
          <Route
            path={ROUTER.USER.PRODUCER_REVIEW_PORTFOLIO}
            element={<ProducerPortfolioPage />}
          />
          <Route
            path={ROUTER.USER.PROJECTMANAGE}
            element={<MyProjectsPage />}
          />
          <Route path={ROUTER.USER.PROPACKAGE} element={<ProPackagePage />} />
          <Route
            path={ROUTER.USER.PROPACKAGE_MANAGE}
            element={<ManageSubscriptionPage />}
          />
          <Route
            path={ROUTER.USER.SUBSCRIPTION_RETURN}
            element={<SubscriptionReturnPage />}
          />
          <Route
            path={ROUTER.USER.SUBSCRIPTION_CANCEL}
            element={<SubscriptionReturnPage />}
          />
          <Route
            path={ROUTER.USER.CONTRACT_PAYMENT_RETURN}
            element={<ContractPaymentReturnPage mode="return" />}
          />
          <Route
            path={ROUTER.USER.CONTRACT_PAYMENT_CANCEL}
            element={<ContractPaymentReturnPage mode="cancel" />}
          />
          <Route
            path={ROUTER.USER.TERMINATION_PAYMENT_RETURN}
            element={<TerminationPaymentReturnPage mode="return" />}
          />
          <Route
            path={ROUTER.USER.TERMINATION_PAYMENT_CANCEL}
            element={<TerminationPaymentReturnPage mode="cancel" />}
          />
          {/* Generic payment return route - handles backend redirects, auto-detects payment type */}
          <Route
            path={ROUTER.USER.PAYMENTS_RETURN}
            element={<PaymentReturnWrapper mode="return" />}
          />

          <Route path={ROUTER.USER.CONTRACT} element={<CreateContractPage />} />
          <Route path={ROUTER.USER.SPLITMONEY} element={<SplitSheetPage />} />
          <Route
            path={ROUTER.USER.PROJECT_WORKSPACE}
            element={<ProjectWorkspaceDetailPage />}
          />
          <Route
            path={ROUTER.USER.INTERNAL_STUDIO}
            element={<InternalStudioPage />}
          />
          <Route path={ROUTER.USER.CLIENT_ROOM} element={<ClientRoomPage />} />
          <Route
            path={ROUTER.USER.TRACK_DETAIL}
            element={<TrackDetailPage />}
          />
          {/* Utilities */}
          <Route path={ROUTER.USER.LOADINGPAGE} element={<LoadingPage />} />
          <Route path={ROUTER.USER.HEATMAP} element={<HeatmapFeedbackPage />} />
          <Route path={ROUTER.USER.ABOUTUS} element={<AboutUs />} />
          <Route
            path={ROUTER.USER.LYRICS_SUGGESTION}
            element={<LyricsSuggestionPage />}
          />
          <Route
            path={`${ROUTER.USER.DESCRIPTION}/:projectId/:milestoneId`}
            element={<DescriptionPage />}
          />
          <Route path={ROUTER.USER.VERIFY_CCCD} element={<VerifyCccdPage />} />
          <Route path={ROUTER.USER.TICKETS} element={<TicketsPage />} />
          <Route path={ROUTER.USER.MYTICKETS} element={<MyTicketsPage />} />
          <Route path={ROUTER.USER.FINANCE} element={<FinancePage />} />
          <Route path={ROUTER.USER.TAX} element={<TaxPage />} />
          <Route path={ROUTER.USER.WITHDRAWALS} element={<WithdrawalPage />} />
          <Route
            path={ROUTER.USER.PROJECT_EXPENSE_STATISTICS}
            element={<ProjectExpenseStatisticsPage />}
          />
        </Route>

        {/* ============================================ */}
        {/* ADMIN ROUTES - WITH ADMINLAYOUT */}
        {/* ============================================ */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            path={ROUTER.ADMIN.USERMANAGEMENT}
            element={<UserManagement />}
          />
          <Route path={ROUTER.ADMIN.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTER.ADMIN.SUPPORT} element={<AdminTicketsPage />} />
          <Route path={ROUTER.ADMIN.DRAWALS} element={<WithdrawalsPage />} />
          <Route
            path={ROUTER.ADMIN.RANKINGMANAGEMENT}
            element={<RankManagementPage />}
          />
          <Route
            path={ROUTER.ADMIN.PRODUCERPACKAGE}
            element={<ProducerPackagePage />}
          />
          <Route
            path={ROUTER.ADMIN.PACKAGEHISTORY}
            element={<PackageHistoryPage />}
          />
          <Route
            path={ROUTER.ADMIN.ADVERTISEMENT}
            element={<AdvertisementManagementPage />}
          />
          <Route path={ROUTER.ADMIN.TAX} element={<TaxAdminPage />} />
          <Route
            path={ROUTER.ADMIN.USER_GUIDE}
            element={<UserGuideManagement />}
          />
        </Route>
        <Route path={ROUTER.NOTFOUND[404]} element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

const RouterCustom = () => {
  return RenderUserRouter();
};

export default RouterCustom;
