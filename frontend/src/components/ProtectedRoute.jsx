import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container" style={{ padding: 60 }}>Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

const STATUS_LABEL = {
  pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối', hidden: 'Đã ẩn',
  accepted: 'Đã nhận', completed: 'Hoàn tất', cancelled: 'Đã hủy',
  active: 'Hoạt động', locked: 'Đã khóa',
};

export function StatusPill({ status }) {
  return <span className={`pill pill-${status}`}>{STATUS_LABEL[status] || status}</span>;
}
