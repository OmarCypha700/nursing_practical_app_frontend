// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { api } from "@/lib/api";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft } from "lucide-react";

// export default function ProceduresPage() {
//   const { programId, studentId } = useParams();
//   const router = useRouter();
//   const [procedures, setProcedures] = useState([]);

//   useEffect(() => {
//     if (!programId || !studentId) return;

//     api
//       .get(`/exams/programs/${programId}/procedures/`, {
//         params: { student_id: studentId }
//       })
//       .then((res) => setProcedures(res.data))
//       .catch((err) => console.error(err));
//   }, [programId, studentId]);

//   const getStatusConfig = (status) => {
//     const configs = {
//       pending: {
//         label: "Pending",
//         className: "bg-yellow-500 hover:bg-yellow-600 text-white"
//       },
//       scored: {
//         label: "Ready to Reconcile",
//         className: "bg-blue-500 hover:bg-blue-600 text-white"
//       },
//       reconciled: {
//         label: "Reconciled",
//         className: "bg-green-500 hover:bg-green-600 text-white"
//       }
//     };
//     return configs[status] || configs.pending;
//   };

//   const handleProcedureClick = (proc) => {
//     // If reconciled, maybe show view-only or prevent access
//     if (proc.status === "reconciled") {
//       alert("This procedure has already been reconciled.");
//       return;
//     }

//     // Go to scoring page for pending or scored
//     router.push(
//       `/programs/${programId}/students/${studentId}/procedures/${proc.id}`
//     );
//   };

//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <div className="flex items-center mb-4 gap-4">
//         <Button variant="ghost" size="sm" onClick={() => router.back()}>
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
//         <h1 className="text-2xl font-bold mb-4">Select Procedure ()</h1>
//       </div>

//       <div className="space-y-3">
//         {procedures.map((proc) => {
//           const statusConfig = getStatusConfig(proc.status);

//           return (
//             <div
//               key={proc.id}
//               className="flex items-center gap-3 w-full"
//             >
//               <button
//                 onClick={() => handleProcedureClick(proc)}
//                 className="flex-1 flex-col md:flex-row text-left uppercase font-semibold rounded-md bg-gray-200 px-4 py-3 hover:bg-gray-300 flex items-center justify-between"
//                 disabled={proc.status === "reconciled"}
//               >
//                 <span>{proc.name}</span>
//                 <Badge className={statusConfig.className}>
//                   {statusConfig.label}
//                 </Badge>
//               </button>

//               {/* Show Reconcile button ONLY for "scored" procedures */}
//               {proc.status === "scored" && (
//                 <Button
//                   onClick={() =>
//                     router.push(
//                       `/programs/${programId}/students/${studentId}/procedures/${proc.id}/reconcile`
//                     )
//                   }
//                   className="bg-blue-600 hover:bg-blue-700"
//                 >
//                   Reconcile
//                 </Button>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, ArrowLeft, RefreshCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function ProceduresPage() {
  const { programId, studentId } = useParams();
  const router = useRouter();
  const [procedures, setProcedures] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!programId || !studentId) return;

    // Fetch student details
    const fetchStudent = api.get(`/exams/students/${studentId}/`);

    // Fetch procedures
    const fetchProcedures = api.get(
      `/exams/programs/${programId}/procedures/`,
      {
        params: { student_id: studentId },
      }
    );

    Promise.all([fetchStudent, fetchProcedures])
      .then(([studentRes, proceduresRes]) => {
        setStudent(studentRes.data);
        setProcedures(proceduresRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [programId, studentId]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: "Pending",
        className: "bg-yellow-500 normal-case hover:bg-yellow-600 text-white",
      },
      scored: {
        label: "Ready to Reconcile",
        className: "bg-blue-500 normal-case hover:bg-blue-600 text-white",
      },
      reconciled: {
        label: "Reconciled",
        className: "bg-green-500 normal-case hover:bg-green-600 text-white",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleProcedureClick = (proc) => {
    if (proc.status === "reconciled") {
      // alert("This procedure has already been reconciled.");
         toast.info("This procedure has already been reconciled.");

      return;
    }

    router.push(
      `/programs/${programId}/students/${studentId}/procedures/${proc.id}`
    );
  };

  if (loading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Student Info Header */}
      {student && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{student.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                Index Number: {student.index_number}
              </p>
              {student.program && (
                <p className="text-sm text-muted-foreground">
                  Program: {student.program.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex item-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl uppercase font-bold mb-4">Select Procedure</h1>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-3">
        {procedures.map((proc) => {
          const statusConfig = getStatusConfig(proc.status);

          return (
            // <div key={proc.id} className="flex items-center gap-3 w-full">
            //   <button
            //     onClick={() => handleProcedureClick(proc)}
            //     className="flex-1 text-left uppercase font-semibold rounded-md bg-gray-200 px-4 py-3 hover:bg-gray-300 flex items-center justify-between"
            //     disabled={proc.status === "reconciled"}
            //   >
            //     <span>{proc.name}</span>
            //     <Badge className={statusConfig.className}>
            //       {statusConfig.label}
            //     </Badge>
            //   </button>

            //   {proc.status === "scored" && (
            //     <Button
            //       size="sm"
            //       onClick={() =>
            //         router.push(
            //           `/programs/${programId}/students/${studentId}/procedures/${proc.id}/reconcile`
            //         )
            //       }
            //       className="bg-blue-600 hover:bg-blue-700"
            //     >
            //       Reconcile
            //     </Button>
            //   )}
            // </div>
            <Card
              key={proc.id}
              // onClick={() => handleProcedureClick(proc)}
              className="cursor-pointer transition hover:shadow-md hover:border-primary"
              // disabled={proc.status === "reconciled"}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* <Icon className="h-6 w-6 text-primary" /> */}
                  <Badge variant="secondary" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>

                  {proc.status === "scored" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/programs/${programId}/students/${studentId}/procedures/${proc.id}/reconcile`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Reconcile <RefreshCcw className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>

                <CardTitle 
                onClick={() => handleProcedureClick(proc)}
                className="text-lg uppercase cursor-pointer underline"
                disabled={proc.status === "reconciled"}>
                  {proc.name}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
