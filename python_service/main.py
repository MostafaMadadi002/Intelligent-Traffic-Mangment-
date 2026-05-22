from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from yolo_model import TrafficAnalyzer

app = FastAPI(title="Smart Traffic AI Service")
analyzer = TrafficAnalyzer()

class DetectionRequest(BaseModel):
    video_url: str
    camera_id: str

@app.get("/")
async def health_check():
    return {"status": "online", "model": "yolov8n", "tasks": ["vehicle-detection", "density-estimation"]}

@app.post("/detect")
async def detect_traffic(request: DetectionRequest):
    """
    Receives a video URL, processes a frame, and returns vehicle counts and density.
    """
    try:
        results = analyzer.process_frame(request.video_url)
        return {
            "camera_id": request.camera_id,
            "detections": results,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
