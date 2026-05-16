// js file 5
// js5.js – Doanh thu TB theo Ngày trong tháng
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg5").attr("viewBox", [0,0,1200,600]);
  const margin = {top: 60, right: 40, bottom: 100, left: 100};
  const width = 1200, height = 600;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 30)
    .attr("text-anchor","middle")
    .attr("font-size", 20)
    .attr("font-weight","bold")
    .text("Doanh số bán hàng theo Ngày trong tháng");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]||0).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]||0).replace(/,/g,"");
    const revenue = sl * dongia;
    const date = new Date(d["Thời gian tạo đơn"]);
    const day = date.getDate(); // 1–31
    return { date, day, revenue, sl };
  }).then(data => {
    // Tổng theo ngày
    const daily = d3.rollups(
      data,
      v => ({
        TongDoanhThu: d3.sum(v, d => d.revenue),
        TongSKU: d3.sum(v, d => d.sl)
      }),
      d => d3.timeDay(d.date)
    ).map(([date, vals]) => ({
      date, day: new Date(date).getDate(),
      TongDoanhThu: vals.TongDoanhThu,
      TongSKU: vals.TongSKU
    }));

    // Trung bình theo ngày trong tháng
    const grouped = d3.rollups(
      daily,
      v => ({
        DoanhThuTB: d3.mean(v, d => d.TongDoanhThu),
        SKUTB: d3.mean(v, d => d.TongSKU)
      }),
      d => d.day
    ).map(([day, vals]) => ({
      day,
      DoanhThuTB: vals.DoanhThuTB,
      DoanhThuM: vals.DoanhThuTB/1e6,
      SKUTB: vals.SKUTB
    }));

    grouped.sort((a,b) => d3.ascending(a.day, b.day));

    // best/worst
    const best = d3.max(grouped, d => d.DoanhThuTB);
    const worst = d3.min(grouped, d => d.DoanhThuTB);
    const bestDay = grouped.find(d => d.DoanhThuTB === best);
    const worstDay = grouped.find(d => d.DoanhThuTB === worst);

    console.log(`Ngày tốt nhất: ${bestDay.day}, TB=${bestDay.DoanhThuTB.toFixed(0)} VND, SKU=${bestDay.SKUTB.toFixed(0)}`);
    console.log(`Ngày kém nhất: ${worstDay.day}, TB=${worstDay.DoanhThuTB.toFixed(0)} VND, SKU=${worstDay.SKUTB.toFixed(0)}`);

    const x = d3.scaleBand()
      .domain(grouped.map(d => d.day))
      .range([0, innerW])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.DoanhThuM)]).nice()
      .range([innerH, 0]);

    // trục
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d => "Ngày " + d))
      .selectAll("text")
        .attr("transform","rotate(45)")
        .style("text-anchor","start");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d + "M"));

    // vẽ cột
    const color = d3.scaleSequential()
      .domain([0, grouped.length])
      .interpolator(d3.interpolateSpectral);

    g.selectAll("rect")
      .data(grouped)
      .join("rect")
        .attr("x", d => x(d.day))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d,i) => color(i))
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>Ngày ${d.day}</b><br>
                 Doanh thu TB: ${d.DoanhThuM.toFixed(1)} triệu VNĐ<br>
                 SL TB: ${d.SKUTB.toFixed(0)}`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("y", d => y(d.DoanhThuM))
        .attr("height", d => innerH - y(d.DoanhThuM));

    // bỏ grid + spines (d3 mặc định không có spines, nên chỉ cần bỏ grid y)
    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();
  });
})();
