import React, { ReactNode } from "react";
import {MyDailyAttendance, MyMonthlyAttendance} from "@/apis/models/my-attendance";
import {TimelineEvent} from "@/apis/models/timeline";
import {HkBadge} from "@/components/@hk-badge/@hk-badge";
import {getAttendanceStatusLabel, getAttendanceStatusColor} from "@/constants/AttendanceStatus";
import {formatDate, formatTime} from "@/utils/DateTimeFormatter";
import {LightGalleryImage} from "@/components/LightGallery/LightGalleryImage";
import {AttendanceClockType} from "@/constants/AttendanceClockType";
interface CalendarEvent {
    backgroundColor: string;
    borderColor: string;
    title: string;
    start: string;
    extendedProps: {
        toHtml: string;
    };
}

interface MonthlyAttendanceSummary {
    newCounts: { [key: string]: number };
    monthAttendance: CalendarEvent[];
}

export function formatDailyAttendance(attendanceData: MyDailyAttendance[], t: (key: string) => string): TimelineEvent[] {
    const groupedByYear: TimelineEvent[] = [];

    attendanceData.forEach((attendance) => {
        const items: { title: ReactNode; description: ReactNode; footinfo: ReactNode }[] = [];

        let timelineTitle = '';
        let timelineDescription = '';
        
        if (attendance.matchings && attendance.matchings.length > 0) {
            attendance.matchings.forEach((matching) => {
                if (matching.by === 'wifi') {
                    timelineTitle = matching.matching_info;
                } else if (matching.by === 'geolocation') {
                    timelineDescription = matching.matching_info;
                }
            });
        }

        const attendanceType = t(AttendanceClockType[attendance.type as keyof typeof AttendanceClockType]);

        items.push({
            title: (
                <div>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="fs-6">{attendanceType}</div>
                        {attendance.mode.toLowerCase() !== 'normal' && (
                            <HkBadge bg="yellow" soft className="text-uppercase">
                                {t(attendance.mode)}
                            </HkBadge>
                        )}
                    </div>
                    {(timelineTitle || timelineDescription) && <div className="separator my-2" />}
                </div>
            ),
            description: (
                <div className="d-flex justify-content-between">
                    <div>
                        {timelineTitle && (
                            <div className="d-flex align-items-center mb-1">
                                <i className="text-dark bi bi-wifi me-2" />
                                <span className="fs-7 text-muted fw-medium">{timelineTitle}</span>
                            </div>
                        )}
                        {timelineDescription && (
                            <div className="d-flex align-items-center">
                                <i className="text-dark bi bi-geo-alt me-2" />
                                <span className="fs-7 text-muted fw-medium">{timelineDescription}</span>
                            </div>
                        )}
                    </div>
                    {attendance.selfie && 
                        <LightGalleryImage src={attendance.selfie.temp_url} className="d-block img-fluid h-50p" />
                    }
                </div>
            ),
            footinfo: (
                <div>
                   
                </div>
            ), // Optional: Add summary or first matching here
        });

        const dateTime = formatTime(new Date(attendance.clocked_at));
        const status = attendance.status.toLowerCase().toString();
        const badgeColor = getAttendanceStatusColor(status);
        const statusLabel = t(getAttendanceStatusLabel(status));

        groupedByYear.push({
            title: (
                <span className="d-flex align-items-center">
                    <span className="h5 mb-0">{dateTime}</span>
                    <HkBadge bg={badgeColor} soft className="text-uppercase ms-2">
                        {statusLabel}
                    </HkBadge>
                </span>
            ),
            items,
        });
    });

    return groupedByYear;
}

export function formatMonthlyAttendance(monthlyAttendanceData: MyMonthlyAttendance[], t: (key: string) => string): MonthlyAttendanceSummary {
    const monthAttendance: CalendarEvent[] = [];
    const newCounts: { [key: string]: number } = {
        normal: 0,
        early: 0,
        late: 0,
        absent: 0,
        overtime: 0,
        skipped: 0,
    };
  
    monthlyAttendanceData.forEach((attendance) => {
        const attendanceType = attendance.status.toLowerCase();
        const badgeColor = getAttendanceStatusColor(attendanceType);
        const statusLabel = t(getAttendanceStatusLabel(attendanceType));

        newCounts[attendanceType] = (newCounts[attendanceType] || 0) + attendance.count;

        if (attendance.metas && attendance.metas.length > 0) {
            attendance.metas.forEach((meta) => {
                const thisDate = formatDate(new Date(meta.date)); // Assumes formatDate outputs 'YYYY-MM-DD'
                monthAttendance.push({
                    backgroundColor: "#fff",
                    borderColor: "#fff",
                    title: `<span class="badge badge-${badgeColor} badge-indicator badge-indicator-md me-1"></span><span class="text-secondary fw-medium">${statusLabel}</span>`,
                    start: thisDate,
                    extendedProps: {
                        toHtml: "convert",
                    },
                });
            });
        }
    });

    return { newCounts, monthAttendance };
};
