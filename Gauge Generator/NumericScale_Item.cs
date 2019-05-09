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
    class NumericScale_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        //PRIVATE VARIABLES
        int _rangemin;
        int _rangemax;
        int _rangestep;
        double _distancefromcenter;
        double _fontsize;
        string _fontfamily;
        MEDIA.Color _fontcolor;
        bool _rotated;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public int RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateInt(value, RangeSource.RangeStartValue, RangeMax);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public int RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateInt(value, RangeMin, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Render frequency"), Category("Range")]
        public int RangeStep
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateInt(value, 1, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Distance between center of labels and center of the clock face"), Category("Position")]
        public double DistanceFromCenter
        {
            get { return _distancefromcenter; }
            set { _distancefromcenter = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("Rotate text around the center"), Category("Position")]
        public bool Rotated
        {
            get { return _rotated; }
            set { _rotated = value; }
        }
        [Description("Font color"), Category("Font")]
        public MEDIA.Color FontColor
        {
            get { return _fontcolor; }
            set { _fontcolor = ValidateColor(value, false); }
        }
        [Description("Font size"), Category("Font")]
        public double FontSize
        {
            get { return _fontsize; }
            set { _fontsize = ValidateDouble(value, 0.05, 0.2); }
        }
        [Description("Font family"), Category("Font")]
        public string FontFamily
        {
            get { return _fontfamily; }
            set { _fontfamily = ValidateString(value, 30); }
        }

        public NumericScale_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _rangemin = 0;
            _rangemax = 100;
            _rangestep = 10;
            _distancefromcenter = 0.85;
            _fontcolor = MEDIA.Colors.White;
            _fontsize = 0.1;
            _fontfamily = "Arial";
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
                _rangemin = ValidateInt(_rangemin, RangeSource.RangeStartValue, RangeMax);
                _rangemax = ValidateInt(_rangemax, RangeMin, RangeSource.RangeEndValue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            if (RangeSource.OpeningAngle != 0 && RangeMax - RangeMin != 0)
            {
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource.CircleCenter_X, RangeSource.CircleCenter_Y);
                double circle = DistanceFromCenter * RangeSource.CircleRadius * half_size;
                int fsize = (int)(FontSize * half_size);
                for (int i = RangeMin; i <= RangeMax; i += RangeStep)
                {
                    double ang = i / (double)RangeSource.RangeEndValue * RangeSource.OpeningAngle + RangeSource.AngleStart;
                    Global.DrawString(ref can,
                                      Global.GetPointOnCircle(c, circle, ang),
                                      fsize,
                                      FontFamily,
                                      i.ToString(),
                                      FontColor,
                                      Rotated ? ang : 0);
                }
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource.CircleCenter_X, RangeSource.CircleCenter_Y);
            Shape s = Global.DrawArc(ref can,
                                     false,
                                     c,
                                     (int)Math.Round(RangeMin / (double)RangeSource.RangeEndValue * RangeSource.OpeningAngle + RangeSource.AngleStart),
                                     (int)Math.Round((RangeMax - RangeMin) / (double)RangeSource.RangeEndValue * RangeSource.OpeningAngle),
                                     (int)Math.Round(DistanceFromCenter * RangeSource.CircleRadius * half_size),
                                     10,
                                     Global.Overlay1);
            Global.AddOpacityAnimation(s);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
