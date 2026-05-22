import cv2
try:
    from ultralytics import YOLO
except ImportError:
    print("Warning: ultralytics not installed. Monitoring will run in simulation mode.")
    YOLO = None

class TrafficAnalyzer:
    def __init__(self):
        # Load the lightweight nano model for performance
        if YOLO:
            self.model = YOLO('yolov8n.pt') 
        else:
            self.model = None
            
        # Standard COCO classes for vehicles
        self.vehicle_classes = [2, 3, 5, 7] # car, motorcycle, bus, truck

    def process_frame(self, source_url):
        """
        In a real scenario, this would capture a frame from the RTSP/HTTP stream,
        run YOLOv8 inference, and count objects.
        """
        if not self.model:
            # Simulated results if YOLO is not available
            return {
                "vehicleCounts": {"car": 12, "motorcycle": 4, "truck": 2, "bus": 1},
                "density": 45.5,
                "congestionLevel": "medium"
            }

        # Real processing (example logic)
        cap = cv2.VideoCapture(source_url)
        ret, frame = cap.read()
        cap.release()

        if not ret:
            raise Exception("Could not capture frame from source")

        results = self.model(frame)[0]
        counts = {"car": 0, "motorcycle": 0, "truck": 0, "bus": 0}
        
        for box in results.boxes:
            cls_id = int(box.cls[0])
            if cls_id == 2: counts["car"] += 1
            elif cls_id == 3: counts["motorcycle"] += 1
            elif cls_id == 5: counts["bus"] += 1
            elif cls_id == 7: counts["truck"] += 1

        total_count = sum(counts.values())
        density = min(100, (total_count / 30) * 100) # Simple density heuristic

        return {
            "vehicleCounts": counts,
            "density": round(density, 2),
            "congestionLevel": "high" if density > 70 else "medium" if density > 30 else "low"
        }
