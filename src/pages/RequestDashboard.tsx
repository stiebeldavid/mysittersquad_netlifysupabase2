import { useQuery } from "@tanstack/react-query";
import { format, isThisYear } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fetchRequests } from "@/lib/airtable";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

interface Request {
  id: string;
  date: string;
  timeRange: string;
  babysitterId: string;
  babysitterName: string;
  status: string;
  createdAt: string;
  babysitterDeleted?: boolean;
}

interface GroupedRequest {
  date: string;
  timeRange: string;
  createdAt: string;
  babysitters: {
    id: string;
    name: string;
    status: string;
    deleted?: boolean;
  }[];
}

const formatTimeRange = (timeRange: string) => {
  const [startTime, endTime] = timeRange.split(" to ");
  
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  const startHour12 = startHour % 12 || 12;
  const startPeriod = startHour >= 12 ? 'pm' : 'am';
  const formattedStart = `${startHour12}:${startMinute.toString().padStart(2, '0')}`;
  
  const endHour12 = endHour % 12 || 12;
  const endPeriod = endHour >= 12 ? 'pm' : 'am';
  const formattedEnd = `${endHour12}:${endMinute.toString().padStart(2, '0')}`;
  
  if (startPeriod === endPeriod) {
    return `${formattedStart}-${formattedEnd}${endPeriod}`;
  }
  
  return `${formattedStart}${startPeriod}-${formattedEnd}${endPeriod}`;
};

const RequestDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [sortBy, setSortBy] = useState<"created" | "date">("created");

  console.log('RequestDashboard - Current user:', user);

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['requests', user?.mobile],
    queryFn: () => {
      console.log('RequestDashboard - Fetching requests for user mobile:', user?.mobile);
      if (!user?.mobile) {
        console.error('RequestDashboard - No user mobile found in auth store');
        return [];
      }
      return fetchRequests(user.mobile);
    },
    enabled: !!user?.mobile,
  });

  console.log('RequestDashboard - Query results:', { 
    isLoading, 
    error, 
    requestsCount: requests.length,
    requests 
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const handleSortChange = (value: string | undefined) => {
    if (value) {
      setSortBy(value as "created" | "date");
    }
  };

  const groupedRequests = requests.reduce((acc: GroupedRequest[], request) => {
    const key = `${request.date}-${request.timeRange}`;
    const existingGroup = acc.find(
      (group) => group.date === request.date && group.timeRange === request.timeRange
    );

    if (existingGroup) {
      existingGroup.babysitters.push({
        id: request.babysitterId,
        name: request.babysitterName,
        status: request.status,
        deleted: request.babysitterDeleted,
      });
    } else {
      acc.push({
        date: request.date,
        timeRange: request.timeRange,
        createdAt: request.createdAt,
        babysitters: [
          {
            id: request.babysitterId,
            name: request.babysitterName,
            status: request.status,
            deleted: request.babysitterDeleted,
          },
        ],
      });
    }

    return acc;
  }, []);

  const sortedRequests = [...groupedRequests].sort((a, b) => {
    if (sortBy === "created") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (isLoading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">My Requests</h1>
        </div>
        
        <ToggleGroup 
          type="single" 
          value={sortBy} 
          onValueChange={handleSortChange}
          className="justify-start"
        >
          <ToggleGroupItem value="created">Sort by Created Date</ToggleGroupItem>
          <ToggleGroupItem value="date">Sort by Babysitting Date</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-4">
        {sortedRequests.map((groupedRequest) => {
          const requestDate = new Date(groupedRequest.date);
          const createdDate = new Date(groupedRequest.createdAt);
          const dateFormat = isThisYear(requestDate) ? "EEEE, MMMM d" : "EEEE, MMMM d, yyyy";
          
          return (
            <Card key={`${groupedRequest.date}-${groupedRequest.timeRange}`} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <CardTitle className="text-lg font-semibold">
                    {format(requestDate, dateFormat)}
                  </CardTitle>
                  <span className="text-sm font-medium text-muted-foreground tracking-wide">
                    {formatTimeRange(groupedRequest.timeRange)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {groupedRequest.babysitters.map((babysitter) => (
                    <div
                      key={babysitter.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <span>
                        {babysitter.name}
                        {babysitter.deleted && (
                          <span className="text-muted-foreground ml-1">(deleted)</span>
                        )}
                      </span>
                      <Badge className={getStatusColor(babysitter.status)}>
                        {babysitter.status}
                      </Badge>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground pt-2">
                    Request Created: {format(createdDate, "MMM d, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No babysitting requests yet.</p>
          <p className="text-gray-500">Create a new request to get started!</p>
        </div>
      )}
    </div>
  );
};

export default RequestDashboard;
