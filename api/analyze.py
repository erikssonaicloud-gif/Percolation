from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        raw_text = data.get('text', '')
        # Split text into usable units
        lines = [line.strip() for line in raw_text.split('\n') if len(line.strip()) > 10]
        
        if len(lines) < 3:
            result = {"status": "error", "message": "Need more data."}
        else:
            # 1. Embeddings
            vectorizer = TfidfVectorizer(stop_words='english')
            X = vectorizer.fit_transform(lines)
            similarity_matrix = cosine_similarity(X)
            
            # 2. Clustering
            distance_matrix = 1 - similarity_matrix
            dbscan = DBSCAN(eps=0.7, min_samples=2, metric='precomputed')
            labels = dbscan.fit_predict(distance_matrix)
            
            # 3. Percolation Calculation
            unique_labels = set(labels)
            if -1 in unique_labels: unique_labels.remove(-1)
            
            cluster_sizes = [np.sum(labels == l) for l in unique_labels]
            gcc_size = max(cluster_sizes) if cluster_sizes else 0
            stress = round((gcc_size / len(lines)) * 100, 2)
            
            result = {
                "system_status": "PHASE TRANSITION" if stress > 45 else "STABLE",
                "metrics": {
                    "total_nodes_analyzed": len(lines),
                    "clusters_identified": len(unique_labels),
                    "noise_nodes_isolated": int(np.sum(labels == -1)),
                    "percolation_stress_percent": stress
                }
            }

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
