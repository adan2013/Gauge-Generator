using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    public class LinearScale_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        //PRIVATE VARIABLES
        double _rangemin;
        double _rangemax;
        double _rangestep;
        double _linethickness;
        double _distancefromcenter;
        double _linelength;
        bool _drawarconedge;
        MEDIA.Color _linecolor;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public double RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateDouble(value, RangeSource.RangeStartValue, RangeMax);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public double RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateDouble(value, RangeMin, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Line frequency"), Category("Range")]
        public double Step
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Draw arc on the edge of range"), Category("Range")]
        public bool DrawArcOnEdge
        {
            get { return _drawarconedge; }
            set { _drawarconedge = value; }
        }
        [Description("Line thickness"), Category("Lines")]
        public double LineThickness
        {
            get { return _linethickness; }
            set { _linethickness = ValidateDouble(value, 0.01, 0.05); }
        }
        [Description("Distance between the end of lines and center of the clock face"), Category("Lines")]
        public double DistanceFromCenter
        {
            get { return _distancefromcenter; }
            set { _distancefromcenter = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 0.95); }
        }
        [Description("Line length"), Category("Lines")]
        public double LineLength
        {
            get { return _linelength; }
            set { _linelength = ValidateDouble(value, 0.05, 1); }
        }
        [Description("Line color"), Category("Lines")]
        public MEDIA.Color LineColor
        {
            get { return _linecolor; }
            set { _linecolor = ValidateColor(value, false); }
        }

        public LinearScale_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _rangemin = 0;
            _rangemax = 100;
            _rangestep = 10;
            _linethickness = 0.01;
            _distancefromcenter = 0.95;
            _linelength = 0.05;
            _drawarconedge = false;
            _linecolor = MEDIA.Colors.White;
            ValidateWithSource();
            base.LoadDefaultValues();
        }

        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _rangemin = obj.RangeStartValue;
            _rangemax = obj.RangeEndValue;
            _rangestep = (_rangemax - _rangemin) / DEFAULT_STEP_PARTS;
        }

        public override void ValidateWithSource()
        {
            if (RangeSource != null)
            {
                _rangemin = ValidateDouble(_rangemin, RangeSource.RangeStartValue, RangeMax);
                _rangemax = ValidateDouble(_rangemax, RangeMin, RangeSource.RangeEndValue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            if (RangeSource.OpeningAngle != 0 && RangeMax - RangeMin != 0)
            {
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource.CircleCenter_X, RangeSource.CircleCenter_Y);
                double circle1 = (DistanceFromCenter - LineLength < 0 ? 0 : DistanceFromCenter - LineLength) * RangeSource.CircleRadius * half_size;
                double circle2 = DistanceFromCenter * RangeSource.CircleRadius * half_size;
                int weight = (int)(LineThickness * half_size);
                if (DrawArcOnEdge)
                {
                    List<double> points_lst1 = new List<double>();
                    List<Point> points_lst2 = new List<Point>();
                    for (double i = RangeMin; i <= RangeMax; i += Step)
                    {
                        double ang = Math.Round(i / RangeSource.RangeEndValue * RangeSource.OpeningAngle);
                        points_lst1.Add(ang);
                        points_lst2.Add(Global.GetPointOnCircle(c, circle1, ang + RangeSource.AngleStart));
                    }
                    Global.DrawArcWithLines(ref can,
                                            HQmode,
                                            c,
                                            (int)Math.Round(RangeMin / RangeSource.RangeEndValue * RangeSource.OpeningAngle + RangeSource.AngleStart),
                                            (int)Math.Round(RangeMax / RangeSource.RangeEndValue * RangeSource.OpeningAngle),
                                            (int)Math.Round(circle2),
                                            weight,
                                            Color.FromArgb(LineColor.A, LineColor.R, LineColor.G, LineColor.B),
                                            points_lst1,
                                            points_lst2,
                                            circle1
                                            );
                }
                else
                {
                    for (double i = RangeMin; i <= RangeMax; i += Step)
                    {
                        double ang = Math.Round(i / RangeSource.RangeEndValue * RangeSource.OpeningAngle + RangeSource.AngleStart);
                        Global.DrawLine(ref can,
                                        Global.GetPointOnCircle(c, circle1, ang),
                                        Global.GetPointOnCircle(c, circle2, ang),
                                        weight,
                                        Color.FromArgb(LineColor.A, LineColor.R, LineColor.G, LineColor.B));
                    }
                }
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource.CircleCenter_X, RangeSource.CircleCenter_Y);
            Shape s = Global.DrawCirclePart(ref can,
                                            false,
                                            c,
                                            (int)Math.Round(RangeMin / RangeSource.RangeEndValue * RangeSource.OpeningAngle + RangeSource.AngleStart),
                                            (int)Math.Round(RangeMax / RangeSource.RangeEndValue * RangeSource.OpeningAngle),
                                            (int)Math.Round(DistanceFromCenter * RangeSource.CircleRadius * half_size),
                                            Global.Overlay1);
            Global.AddOpacityAnimation(s);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
