// js file 4
// js4.js – Doanh thu trung bình theo ngày trong tuần
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg4").attr("viewBox", [0,0,1000,600]);
  const margin = {top: 60, right: 40, bottom: 60, left: 120};
  const width = 1000, height = 600;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
    .attr("x", width/2)
    .attr("y", 30)
    .attr("text-anchor","middle")
    .attr("font-size", 20)
    .attr("font-weight","bold")
    .text("Doanh thu trung bình theo ngày trong tuần");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]||0).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]||0).replace(/,/g,"");
    const revenue = sl * dongia;
    const date = new Date(d["Thời gian tạo đơn"]);
    const weekday = date.getDay(); // 0=CN,1=Thứ 2,...6=Thứ 7
    return { date, weekday, revenue, sl };
  }).then(data => {
    // gộp theo ngày để lấy tổng
    const daily = d3.rollups(
      data,
      v => ({
        revenue: d3.sum(v, d => d.revenue),
        sl: d3.sum(v, d => d.sl)
      }),
      d => d3.timeDay(d.date)
    ).map(([date, vals]) => ({
      date, revenue: vals.revenue, sl: vals.sl,
      weekday: new Date(date).getDay()
    }));

    // trung bình theo thứ
    const weekdayNames = ["CN","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"];
    const avg = d3.rollups(
      daily,
      v => ({
        revenue: d3.mean(v, d => d.revenue),
        sl: d3.mean(v, d => d.sl)
      }),
      d => d.weekday
    ).map(([w, vals]) => ({
      thu: weekdayNames[w],
      order: w===0 ? 7 : w, // để CN xuống cuối
      revenue: vals.revenue,
      revenueM: vals.revenue/1e6,
      sl: vals.sl
    }));

    avg.sort((a,b) => d3.ascending(a.order, b.order));

    // tìm best/worst
    const best = d3.max(avg, d => d.revenue);
    const worst = d3.min(avg, d => d.revenue);
    const bestDay = avg.find(d => d.revenue === best);
    const worstDay = avg.find(d => d.revenue === worst);

    console.log(`Ngày tốt nhất: ${bestDay.thu}, ~${bestDay.revenue.toFixed(0)} VND, SL=${bestDay.sl.toFixed(0)}`);
    console.log(`Ngày kém nhất: ${worstDay.thu}, ~${worstDay.revenue.toFixed(0)} VND, SL=${worstDay.sl.toFixed(0)}`);

    const x = d3.scaleBand()
      .domain(avg.map(d => d.thu))
      .range([0, innerW])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(avg, d => d.revenueM)]).nice()
      .range([innerH, 0]);

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + " triệu"));

    // vẽ cột
    g.selectAll("rect")
      .data(avg)
      .join("rect")
        .attr("x", d => x(d.thu))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d,i) => d3.schemeSet3[i % 12])
        .attr("stroke","#000")
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>${d.thu}</b><br>
                 Doanh thu TB: ${d.revenueM.toFixed(1)} triệu VNĐ<br>
                 SL TB: ${d.sl.toFixed(0)}`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("y", d => y(d.revenueM))
        .attr("height", d => innerH - y(d.revenueM));

    // nhãn số liệu trên cột
    g.selectAll(".label")
      .data(avg)
      .join("text")
        .attr("x", d => x(d.thu) + x.bandwidth()/2)
        .attr("y", d => y(d.revenueM) - 5)
        .attr("text-anchor","middle")
        .attr("font-size",10)
        .text(d => d.revenue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });
})();
