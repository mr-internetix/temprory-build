import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, X, Minimize2 } from "lucide-react";

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

export function ExecutionModal({
  isOpen,
  onClose,
  requestId,
}: ExecutionModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [stopAtQid, setStopAtQid] = useState("");

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStart = () => {
    setIsPlaying(true);
    // In a real app, this would start the execution process
    console.log("Starting execution for request:", requestId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>iDataGenerator Execution Control</DialogTitle>
        </DialogHeader>
        <div className="relative h-full bg-gradient-to-br from-teal-600 via-blue-600 to-purple-700">
          {/* Header with gradient overlay */}
          <div className="relative bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    iDataGenerator
                  </h2>
                  <div className="text-white/70 text-sm flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      GAME CHANGERS
                    </span>
                    <span>IpsosGroup/Laurebelle.Mancho</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Request ID Section */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="text-white/80 text-sm mb-2">Request Id...</div>
            <Input
              value={requestId}
              readOnly
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
            />
          </div>

          {/* Controls Section */}
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                </div>
                <Select value={stopAtQid} onValueChange={setStopAtQid}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white min-w-[200px]">
                    <SelectValue placeholder="Stop at qID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Q1</SelectItem>
                    <SelectItem value="q2">Q2</SelectItem>
                    <SelectItem value="q3">Q3</SelectItem>
                    <SelectItem value="q4">Q4</SelectItem>
                    <SelectItem value="q5">Q5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handlePlayPause}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleStart}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 mx-6 mb-6 bg-white/90 rounded-lg p-6">
            <div className="h-full flex items-center justify-center text-gray-500">
              {isPlaying ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Execution in progress...</p>
                  <p className="text-sm mt-2">Request ID: {requestId}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-lg mb-2">Ready to execute</p>
                  <p className="text-sm">
                    Configure your stop point and click Start to begin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700">
            <div className="text-center text-white/80 text-sm">
              Developed by : Ipsos DSC Development Team
            </div>
          </div>

          {/* Annotation */}
          <div className="absolute top-20 right-4">
            <div className="bg-white border-2 border-green-500 rounded px-3 py-2 text-sm max-w-[200px]">
              <div className="text-red-500 font-medium">
                Dropdown which question to stop. Can be played and pause anytime
                as well.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
