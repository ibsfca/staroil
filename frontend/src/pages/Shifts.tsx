import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchShifts } from '../store/slices/shiftsSlice';
import MainLayout from '../components/MainLayout';

function Shifts() {
  const dispatch = useAppDispatch();
  const { shifts, isLoading } = useAppSelector((state) => state.shifts);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchShifts({ stationId: user?.stationId || 'all' }));
  }, [dispatch, user?.stationId]);

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shift Management</h1>
          <button className="btn-primary">+ Clock In</button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading shifts...</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts?.map((shift: any) => {
                  const clockInTime = new Date(shift.clockInTime);
                  const clockOutTime = shift.clockOutTime ? new Date(shift.clockOutTime) : null;
                  const duration = clockOutTime 
                    ? `${Math.round((clockOutTime.getTime() - clockInTime.getTime()) / 3600000)}h`
                    : 'In Progress';

                  return (
                    <tr key={shift.id}>
                      <td>Employee {shift.employeeId.slice(0, 4)}</td>
                      <td>{new Date(shift.shiftDate).toLocaleDateString()}</td>
                      <td>{clockInTime.toLocaleTimeString()}</td>
                      <td>{clockOutTime ? clockOutTime.toLocaleTimeString() : '-'}</td>
                      <td>{duration}</td>
                      <td>
                        <span className={`badge badge-${shift.status === 'APPROVED' ? 'success' : 'warning'}`}>
                          {shift.status}
                        </span>
                      </td>
                      <td>
                        <button className="text-primary hover:text-primary-600 text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Shifts;
