using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Shapes;
using System.Windows.Controls;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    public static class Global
    {
        public const double MIN_DOUBLE_VALUE = 0.2;
        public const double MAX_DOUBLE_VALUE = 0.8;
        public const int MIN_RANGE_VALUE = -500;
        public const int MAX_RANGE_VALUE = 500;
        public const int MAX_LAYERS = 30;

        public const int ARC_LOD_LQ = 40;
        public const int ARC_LOD_HQ = 4;
        public const int DURATION_ALPHA_OVERLAY = 1600;
        public const double MIN_ALPHA_OVERLAY = 0.1;
        public const double MAX_ALPHA_OVERLAY = 0.6;
        public static Color Overlay1 { get { return Color.FromArgb(255, 66, 105, 165); } }
        
        public static ProjectData project = new ProjectData();

        public static Canvas ScreenCanvas;
        public static Layer EditingLayer;

        #region "CONFIG"

        public enum LayersType
        {
            Range = 0,
            LinearScale,
            NumericScale,
            Arc,
            Label,
            ClockHand
        }
        public static LayersType GetLayerType(Layer obj)
        {
            if (obj is Range_Item) return LayersType.Range;
            if (obj is LinearScale_Item) return LayersType.LinearScale;
            if (obj is NumericScale_Item) return LayersType.NumericScale;
            //TODO other types
            return LayersType.Range;
        }

        public static Type GetLayerObject(LayersType obj)
        {
            switch (obj)
            {
                case LayersType.Range:
                    return typeof(Range_Item);
                case LayersType.LinearScale:
                    return typeof(LinearScale_Item);
                case LayersType.NumericScale:
                    return typeof(NumericScale_Item);
                //TODO other types
                default:
                    return typeof(Range_Item);
            }
        }
        public static string[] LayerNames = {
            "Range",
            "Linear Scale",
            "Numeric Scale",
            "Arc",
            "Label",
            "Clock Hand"
        };
        public static string[] LayerDescriptions = {
            "Basic element defining size and range of values. It is required by other elements (layers)",
            "Element generates a visible clock scale consisting of lines",
            "Element generates a visible clock scale consisting of numerical values",
            "Element generates a colorful arc. For example, to mark a dangerous range of values",
            "Element generates a custom text label",
            "Element generates a clock hand"
        };
        public static string[] LayerBigImages = {
            "pack://application:,,,/Images/range_item_big.png",
            "pack://application:,,,/Images/linear_scale_big.png",
            "pack://application:,,,/Images/numeric_scale_big.png",
            "pack://application:,,,/Images/arc_big.png",
            "pack://application:,,,/Images/label_big.png",
            "pack://application:,,,/Images/clock_hand_big.png"
        };
        public static string[] LayerSmallImages = {
            "pack://application:,,,/Images/range_item.png",
            "pack://application:,,,/Images/linear_scale.png",
            "pack://application:,,,/Images/numeric_scale.png",
            "pack://application:,,,/Images/arc.png",
            "pack://application:,,,/Images/label.png",
            "pack://application:,,,/Images/clock_hand.png"
        };

        #endregion

        #region "SIDEBAR"

        private static Frame SidebarObject;
        private static Label SidebarTitleObject;
        public static SidebarPages Sidebar { get; private set; }

        public enum SidebarPages
        {
            Layers = 0,
            Editor,
            ProjectSettings
        }

        public static void SetSidebarObject(Frame obj, Label lbl)
        {
            SidebarObject = obj;
            SidebarTitleObject = lbl;
        }

        public static void SetSidebar(SidebarPages newPage)
        {
            Sidebar = newPage;
            switch (Sidebar)
            {
                case SidebarPages.Layers:
                    SidebarObject.NavigationService.Navigate(new Layers_Page());
                    SidebarTitleObject.Content = "Layers";
                    break;
                case SidebarPages.Editor:
                    SidebarObject.NavigationService.Navigate(new Editor_Page());
                    SidebarTitleObject.Content = "Property editor";
                    break;
                case SidebarPages.ProjectSettings:
                    SidebarObject.NavigationService.Navigate(new Project_Settings_Page());
                    SidebarTitleObject.Content = "Project settings";
                    break;
            }
        }

        #endregion

        #region "DRAWING"

        public static Shape DrawArc(ref Canvas obj, bool HQmode, Point center, int startAngle, int openingAngle, int radius, int weight, Color color)
        {
            if (openingAngle == 360)
            {
                return DrawCircle(ref obj, center, radius, weight, color);
            }
            else
            {
                int LoD = GetLoD(HQmode, radius, openingAngle);
                var ArcPoints = new Point[LoD];
                for (int i = 0; i < LoD; i++) ArcPoints[i] = GetPointOnCircle(center, radius, startAngle + (openingAngle / ((double)LoD - 1) * i));
                Polyline pl = new Polyline
                {
                    StrokeThickness = weight,
                    Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
                };
                for (int i = 0; i < LoD; i++) pl.Points.Add(new System.Windows.Point(ArcPoints[i].X, ArcPoints[i].Y));
                obj.Children.Add(pl);
                return pl;
            }
        }
        
        public static Shape DrawArcWithLines(ref Canvas obj, bool HQmode, Point center, int startAngle, int openingAngle, int radius1, int radius2, int weight, Color color, int min, int max, int step)
        {
            if (step == 0 || min == max) new Polyline();

            List<Point> ArcPoints = new List<Point>();
            List<double> bp = new List<double>();

            for (int val = min; val <= max; val += step) bp.Add(startAngle + openingAngle * ((val - min) / (double)(max - min)));
            if (bp.Count == 0) new Polyline();

            double LoD = GetLoD(HQmode, radius2, openingAngle / bp.Count);

            ArcPoints.Add(GetPointOnCircle(center, radius2, bp[0]));
            ArcPoints.Add(GetPointOnCircle(center, radius1, bp[0]));
            ArcPoints.Add(GetPointOnCircle(center, radius2, bp[0]));
            for (int bp_idx = 1; bp_idx < bp.Count; bp_idx++)
            {
                double p1 = bp[bp_idx - 1];
                double p2 = bp[bp_idx] - bp[bp_idx - 1];
                for (int i = 0; i < LoD; i++) ArcPoints.Add(GetPointOnCircle(center, radius2, p1 + p2 * (i / LoD)));
                ArcPoints.Add(GetPointOnCircle(center, radius2, bp[bp_idx]));
                ArcPoints.Add(GetPointOnCircle(center, radius1, bp[bp_idx]));
                ArcPoints.Add(GetPointOnCircle(center, radius2, bp[bp_idx]));
            }
            
            Polyline pl = new Polyline
            {
                StrokeThickness = weight,
                Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            foreach (Point i in ArcPoints) pl.Points.Add(new System.Windows.Point(i.X, i.Y));
            obj.Children.Add(pl);
            return pl;
        }

        public static Shape DrawCirclePart(ref Canvas obj, bool HQmode, Point center, int startAngle, int openingAngle, int radius, Color color)
        {
            if (openingAngle == 360)
            {
                return FillCircle(ref obj, center, radius, color);
            }
            else
            {
                int LoD = GetLoD(HQmode, radius, openingAngle);
                var ArcPoints = new Point[LoD];
                for (int i = 0; i < LoD; i++) ArcPoints[i] = GetPointOnCircle(center, radius, startAngle + (openingAngle / ((double)LoD - 1) * i));
                Polygon pg = new Polygon
                {
                    StrokeThickness = 2,
                    Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B)),
                    Fill = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
                };
                for (int i = 0; i < LoD; i++) pg.Points.Add(new System.Windows.Point(ArcPoints[i].X, ArcPoints[i].Y));
                pg.Points.Add(new System.Windows.Point(center.X, center.Y));
                obj.Children.Add(pg);
                return pg;
            }
        }

        public static Shape DrawCircle(ref Canvas obj, Point center, int radius, int weight, Color color)
        {
            Ellipse el = new Ellipse
            {
                Width = radius * 2,
                Height = radius * 2,
                Margin = new System.Windows.Thickness(center.X - radius, center.Y - radius, 0, 0),
                StrokeThickness = weight,
                Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            obj.Children.Add(el);
            return el;
        }

        public static Shape FillCircle(ref Canvas obj, Point center, int radius, Color color)
        {
            Ellipse el = new Ellipse
            {
                Width = radius * 2,
                Height = radius * 2,
                Margin = new System.Windows.Thickness(center.X - radius, center.Y - radius, 0, 0),
                StrokeThickness = 1,
                Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B)),
                Fill = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            obj.Children.Add(el);
            return el;
        }

        public static Shape DrawLine(ref Canvas obj, Point p1, Point p2, int weight, Color color)
        {
            Line l = new Line
            {
                X1 = p1.X, Y1 = p1.Y,
                X2 = p2.X, Y2 = p2.Y,
                StrokeThickness = weight,
                Stroke = new MEDIA.SolidColorBrush(MEDIA.Color.FromArgb(color.A, color.R, color.G, color.B))
            };
            obj.Children.Add(l);
            return l;
        }

        public static void DrawString(ref Canvas obj, Point p, double size, string font, string text, MEDIA.Color color, double angle)
        {
            TextBlock tb = new TextBlock
            {
                Text = text,
                FontSize = size,
                FontFamily = new MEDIA.FontFamily(font),
                Foreground = new MEDIA.SolidColorBrush(color)
            };
            var formattedText = new MEDIA.FormattedText(
                tb.Text,
                System.Globalization.CultureInfo.CurrentCulture,
                System.Windows.FlowDirection.LeftToRight,
                new MEDIA.Typeface(tb.FontFamily, tb.FontStyle, tb.FontWeight, tb.FontStretch),
                tb.FontSize,
                tb.Foreground,
                new MEDIA.NumberSubstitution(),
                MEDIA.TextFormattingMode.Display);
            tb.Margin = new System.Windows.Thickness(p.X - formattedText.Width / 2, p.Y - formattedText.Height / 2, 0, 0);
            if (angle != 0) tb.RenderTransform = new MEDIA.RotateTransform(angle + 90, formattedText.Width / 2, formattedText.Height / 2);
            obj.Children.Add(tb);
        }

        #endregion

        #region "OVERLAY ALPHA"

        public static void AddOpacityAnimation(Shape obj)
        {
            MEDIA.Animation.DoubleAnimation da = new MEDIA.Animation.DoubleAnimation
            {
                From = MIN_ALPHA_OVERLAY,
                To = MAX_ALPHA_OVERLAY,
                Duration = new System.Windows.Duration(TimeSpan.FromMilliseconds(DURATION_ALPHA_OVERLAY)),
                RepeatBehavior = MEDIA.Animation.RepeatBehavior.Forever,
                AutoReverse = true
            };
            obj.BeginAnimation(System.Windows.UIElement.OpacityProperty, da);
        }

        #endregion

        public static void RefreshScreen()
        {
            if (ScreenCanvas != null) project.DrawProject(ref ScreenCanvas, false, (int)ScreenCanvas.Width);
        }

        public static Point GetPointOnCircle(Point center, double radius, double angle)
        {
            angle = Math.PI * angle / 180.0;
            return new Point((int)Math.Round(radius * Math.Cos(angle) + center.X), (int)Math.Round(radius * Math.Sin(angle) + center.Y));
        }

        public static Point GetOffsetPoint(Point input, double range, double X_Offset, double Y_Offset)
        {
            return new Point((int)Math.Round(input.X + X_Offset * range), (int)Math.Round(input.Y + Y_Offset * range));
        }

        public static int GetLoD(bool HQmode, int radius, int angle)
        {
            int i = (int)(Math.Abs(angle) / 180.0 * Math.PI * radius / (HQmode ? ARC_LOD_HQ : ARC_LOD_LQ));
            i++;
            if (i < 2) i = 2;
            return i;
        }
    }
}
