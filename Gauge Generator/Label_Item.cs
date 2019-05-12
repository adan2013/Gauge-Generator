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
    class Label_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        //PRIVATE VARIABLES
        public double _fontsize;
        public string _fontfamily;
        public bool _bold;
        public bool _italic;
        public bool _underline;
        public MEDIA.Color _fontcolor;
        public double _position_x;
        public double _position_y;
        public int _angle;
        public string _text;

        //PROPERTIES
        [Description("Font color"), Category("Font")]
        public MEDIA.Color FontColor
        {
            get { return _fontcolor; }
            set { _fontcolor = ValidateColor(value, false); }
        }
        [Description("Font size"), Category("Font")]
        public double FontSize
        {
            get { return TranslateValue(_fontsize); }
            set { _fontsize = ValidateDouble(value, 0.05, 0.25); }
        }
        [Description("Font family"), Category("Font")]
        public string FontFamily
        {
            get { return _fontfamily; }
            set { _fontfamily = ValidateFontFamily(value); }
        }
        [Description("Font modifier: bold"), Category("Font")]
        public bool Bold
        {
            get { return _bold; }
            set { _bold = value; }
        }
        [Description("Font modifier: italic"), Category("Font")]
        public bool Italic
        {
            get { return _italic; }
            set { _italic = value; }
        }
        [Description("Font modifier: underline"), Category("Font")]
        public bool Underline
        {
            get { return _underline; }
            set { _underline = value; }
        }
        [Description("X coordinate of the center of label"), Category("Position")]
        public double Position_X
        {
            get { return TranslateValue(_position_x); }
            set { _position_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of label"), Category("Position")]
        public double Position_Y
        {
            get { return TranslateValue(_position_y); }
            set { _position_y = ValidateDouble(value, -1, 1); }
        }
        [Description("Rotation angle"), Category("Position")]
        public int Angle
        {
            get { return _angle; }
            set { _angle = ValidateInt(value, -360, 360); }
        }
        [Description("Displayed text"), Category("Font")]
        public string Text
        {
            get { return _text; }
            set { _text = ValidateString(value, 40); }
        }

        public Label_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _fontcolor = MEDIA.Colors.White;
            _fontsize = 0.1;
            _fontfamily = Global.DEFAULT_FONT;
            _bold = false;
            _italic = false;
            _underline = false;
            _text = "New label";
            _position_x = 0;
            _position_y = 0;
            _angle = 0;
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original)
        {
            base.CloneCreator(original);
            Label_Item o = (Label_Item)original;
            _fontcolor = o._fontcolor;
            _fontsize = o._fontsize;
            _fontfamily = o._fontfamily;
            _bold = o._bold;
            _italic = o._italic;
            _underline = o._underline;
            _text = o._text;
            _position_x = o._position_x;
            _position_y = o._position_y;
            _angle = o._angle;
        }
       
        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            if (_text != "")
            {
                int half_size = size / 2;
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
                int fsize = (int)(_fontsize * half_size);
                Global.DrawString(ref can,
                                    new Point((int)Math.Round(c.X + _position_x * RangeSource._circleradius * half_size), (int)Math.Round(c.Y + _position_y * RangeSource._circleradius * half_size)),
                                    fsize,
                                    _fontfamily,
                                    _bold,
                                    _italic,
                                    _underline,
                                    _text,
                                    _fontcolor,
                                    _angle);
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            Point l = new Point((int)Math.Round(c.X + _position_x * RangeSource._circleradius * half_size), (int)Math.Round(c.Y + _position_y * RangeSource._circleradius * half_size));

            Shape s1 = Global.DrawLine(ref can,
                                       new Point(l.X, 0),
                                       new Point(l.X, size),
                                       5,
                                       Global.Overlay1);
            Shape s2 = Global.DrawLine(ref can,
                                       new Point(0, l.Y),
                                       new Point(size, l.Y),
                                       5,
                                       Global.Overlay1);
            Global.AddOpacityAnimation(s1);
            Global.AddOpacityAnimation(s2);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
