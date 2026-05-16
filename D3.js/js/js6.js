// js6.js – Doanh thu TB theo Khung giờ
(function(){
  const FILE = "data/data.csv";

  const svg = d3.select("#svg6").attr("viewBox", [0,0,1200,600]);
  const margin = {top: 60, right: 40, bottom: 120, left: 100};
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
    .text("Doanh số bán hàng theo Khung giờ");

  const tooltip = d3.select("#tooltip");

  d3.csv(FILE, d => {
    const sl = +String(d["SL"]||0).replace(/,/g,"");
    const dongia = +String(d["Đơn giá"]||0).replace(/,/g,"");
    const revenue = sl * dongia;
    const date = new Date(d["Thời gian tạo đơn"]);
    const hour = date.getHours();
    const slot = String(hour).padStart(2,"0")+":00-"+String(hour).padStart(2,"0")+":59";
    return { date, hour, slot, revenue, sl };
  }).then(data => {
    // B2: tổng theo ngày + khung giờ
    const dailyHour = d3.rollups(
      data,
      v => ({
        TongDoanhThu: d3.sum(v, d => d.revenue),
        TongSKU: d3.sum(v, d => d.sl)
      }),
      d => d3.timeDay(d.date),
      d => d.slot
    ).flatMap(([day, slots]) =>
      slots.map(([slot, vals]) => ({
        day, slot,
        TongDoanhThu: vals.TongDoanhThu,
        TongSKU: vals.TongSKU
      }))
    );

    // B3: trung bình theo khung giờ
    const grouped = d3.rollups(
      dailyHour,
      v => ({
        DoanhThuTB: d3.mean(v, d => d.TongDoanhThu),
        SKUTB: d3.mean(v, d => d.TongSKU)
      }),
      d => d.slot
    ).map(([slot, vals]) => ({
      slot,
      hour: +slot.slice(0,2),
      DoanhThuTB: vals.DoanhThuTB,
      SKUTB: vals.SKUTB
    }));

    grouped.sort((a,b) => d3.ascending(a.hour, b.hour));

    // B4: best/worst
    const best = d3.max(grouped, d => d.DoanhThuTB);
    const worst = d3.min(grouped, d => d.DoanhThuTB);
    const bestSlot = grouped.find(d => d.DoanhThuTB === best);
    const worstSlot = grouped.find(d => d.DoanhThuTB === worst);

    console.log(`Khung giờ tốt nhất: ${bestSlot.slot}, TB=${bestSlot.DoanhThuTB.toFixed(0)} VND, SKU=${bestSlot.SKUTB.toFixed(0)}`);
    console.log(`Khung giờ kém nhất: ${worstSlot.slot}, TB=${worstSlot.DoanhThuTB.toFixed(0)} VND, SKU=${worstSlot.SKUTB.toFixed(0)}`);

    // scale
    const x = d3.scaleBand()
      .domain(grouped.map(d => d.slot))
      .range([0, innerW])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d.DoanhThuTB)]).nice()
      .range([innerH, 0]);

    // axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform","rotate(45)")
        .style("text-anchor","start");

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => {
        if(d>=1e6) return (d/1e6)+"M";
        return (d/1e3)+"K";
      }));

    // color scale
    const color = d3.scaleSequential()
      .domain([0, grouped.length])
      .interpolator(d3.interpolateSpectral);

    // bars
    g.selectAll("rect")
      .data(grouped)
      .join("rect")
        .attr("x", d => x(d.slot))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d,i) => color(i))
      .on("mousemove", (event,d) => {
        tooltip.style("opacity",1)
          .style("left", (event.pageX+15)+"px")
          .style("top", (event.pageY-20)+"px")
          .html(`<b>${d.slot}</b><br>
                 Doanh thu TB: ${d.DoanhThuTB.toLocaleString()} VND<br>
                 SL TB: ${d.SKUTB.toFixed(0)}`);
      })
      .on("mouseleave", ()=>tooltip.style("opacity",0))
      .transition().duration(1000)
        .attr("y", d => y(d.DoanhThuTB))
        .attr("height", d => innerH - y(d.DoanhThuTB));

    // bỏ spines + grid (D3 không có mặc định, chỉ cần xoá domain + tick lines)
    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();
  });
})();
