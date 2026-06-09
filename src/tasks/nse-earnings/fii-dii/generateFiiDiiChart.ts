import { chromium } from "playwright";
import { TSFINNEWS_ICONS } from "../../../../lib/constants/index.js";
import { uploadBufferToImgBB } from "../../../core/imgbb.js";
import { formatDateLabel } from "../../../../lib/helpers/day.js";
import { scrapperBrowser } from "../../../core/scrapper/index.js";

export const generateFiiDiiChart = async (weeklyData: any[]) => {
  console.log("🎨 Generating Premium FII/DII Chart...");
  const { page, context, browser } = await scrapperBrowser();
  const labels = weeklyData.map((d) => formatDateLabel(d.date, "DD MMM"));
  const fiiData = weeklyData.map((d) => d.fiiNetValue);
  const diiData = weeklyData.map((d) => d.diiNetValue);
  try {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body {
          background: radial-gradient(circle at 50% 0%, #1e3a8a 0%, #020617 80%);
          color: #ffffff;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 40px;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin: 20px 0; /* Increased bottom margin */
          text-transform: uppercase;
        }
        h1 { 
          margin: 0 0 12px 0; /* Clearer separation from subtitle */
          font-size: 46px; 
          font-weight: 900;
          color: #38bdf8; 
          letter-spacing: 1.5px;
          word-spacing: 6px; /* 🌟 FIX: Forces space between words */
        }
        h1 span {
          color: #facc15; 
          padding: 0 4px; /* 🌟 FIX: Ensures "DII" doesn't touch adjacent words */
        }
        h2 { 
          margin: 0; 
          font-size: 22px; 
          color: #94a3b8; 
          font-weight: 400; 
          letter-spacing: 2px;
        }
        .chart-container {
          width: 1000px;
          height: 450px;
          position: relative;
        }
          /* Modern Footer */
        .footer {
            margin-top: auto;
            padding: 40px 10px;
            background: linear-gradient(to top, rgba(var(--primary-rgb), 0.1), transparent);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap:4
        }

        .social-pill {
            margin:0 10px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px 20px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
            font-weight: 600;
        }
      </style>
      
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    </head>
    <body>
      <div class="header">
        <h1>FII VS <span>DII</span> CASH MARKET</h1>
        <h2>DAILY NET FLOWS (IN ₹ CRORES) | @tsfinnews</h2>
      </div>
      
      <div class="chart-container">
        <canvas id="myChart"></canvas>
      </div>

      <script>
        Chart.register(ChartDataLabels);

        const ctx = document.getElementById('myChart').getContext('2d');
        
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ${JSON.stringify(labels)},
            datasets: [
              {
                label: 'FII Net (₹ Cr)',
                data: ${JSON.stringify(fiiData)},
                borderColor: '#38bdf8', 
                backgroundColor: '#38bdf8',
                borderWidth: 4,
                tension: 0.4, 
                pointRadius: 6,
                pointBackgroundColor: '#0f172a', 
                pointBorderWidth: 3,
              },
              {
                label: 'DII Net (₹ Cr)',
                data: ${JSON.stringify(diiData)},
                borderColor: '#facc15', 
                backgroundColor: '#facc15',
                borderWidth: 4,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#0f172a',
                pointBorderWidth: 3,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, 
            layout: {
              padding: { top: 30, bottom: 20 } 
            },
            plugins: {
              legend: {
                position: 'top',
                labels: { 
                  color: '#e2e8f0', 
                  font: { size: 16, family: 'Inter', weight: 'bold' },
                  usePointStyle: true,
                  boxWidth: 12,
                  padding: 30 // 🌟 FIX: Spacing between legend items
                }
              },
              datalabels: {
                color: (context) => context.dataset.borderColor, 
                font: { weight: 'bold', size: 16, family: 'Inter' },
                align: (context) => context.datasetIndex === 0 ? 'top' : 'bottom', 
                offset: 10, // Increased offset to push labels further from the dots
                formatter: (value) => {
                  return new Intl.NumberFormat('en-IN').format(Math.round(value));
                }
              }
            },
            scales: {
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 14, family: 'Inter' } }
              },
              x: {
                grid: { display: false },
                offset: true, // 🌟 FIX: Pushes the first data point away from the Y-axis to prevent overlap
                ticks: { color: '#e2e8f0', font: { size: 15, family: 'Inter', weight: 'bold' } }
              }
            }
          }
        });
      </script>
      <div class="footer">
            <div class="social-pill">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.instagram}" style="width:20px;height:20px;" />
                <span>@tsfinnews</span>
            </div>
            <div class="social-pill">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.threads}" style="width:20px;height:20px;" />
                <span>@tsfinnews</span>
            </div>
            <div class="social-pill">
                <img src="data:image/png;base64,${TSFINNEWS_ICONS.facebook}" style="width:20px;height:20px;" />
                <span>@tsfinnews</span>
            </div>
        </div>
    </body>
    </html>
  `;

    // 2. Load the HTML into the page
    await page.setContent(htmlContent);

    const imageBuffer = await page.screenshot({
      type: "jpeg", // Change this from default 'png'
      animations: "disabled",
      omitBackground: true, // Makes the edges clean if you want to overlay it
    });

    console.log("📸 Screenshot captured in memory. Uploading directly...");
    // 2. Upload the buffer and get the URL
    const imageUrl = await uploadBufferToImgBB(imageBuffer);

    return imageUrl;
  } catch (error) {
    console.error(
      "Error generating FII/DII chart image:",
      (error as Error).message,
    );
    return "";
  } finally {
    await page?.close().catch(() => {});
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
  }
};
